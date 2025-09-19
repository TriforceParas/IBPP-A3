import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Popconfirm,
  Typography,
  Card
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined
} from '@ant-design/icons';
import customerService, { type Customer } from '../services/customerService';

const { Title } = Typography;
const { Search } = Input;

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form] = Form.useForm();

  // Load customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch all customers from API
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await customerService.getAllCustomers();
      setCustomers(response.data);
      setFilteredCustomers(response.data);
      message.success('Customers loaded successfully');
    } catch (error) {
      message.error('Failed to load customers');
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search functionality
  const handleSearch = (value: string) => {
    if (!value) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(value.toLowerCase()) ||
        customer.email.toLowerCase().includes(value.toLowerCase()) ||
        customer.phoneNo.includes(value) ||
        customer.address.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  };

  // Open modal for adding new customer
  const handleAddCustomer = () => {
    setEditingCustomer(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Open modal for editing existing customer
  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    form.setFieldsValue(customer);
    setIsModalVisible(true);
  };

  // Handle form submission (both add and edit)
  const handleSubmit = async (values: Customer) => {
    try {
      if (editingCustomer) {
        // Update existing customer
        await customerService.updateCustomer(editingCustomer.id!, values);
        message.success('Customer updated successfully');
      } else {
        // Create new customer
        await customerService.createCustomer(values);
        message.success('Customer added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchCustomers(); // Refresh the list
    } catch (error) {
      message.error(`Failed to ${editingCustomer ? 'update' : 'add'} customer`);
      console.error('Error saving customer:', error);
    }
  };

  // Handle customer deletion
  const handleDeleteCustomer = async (id: number) => {
    try {
      await customerService.deleteCustomer(id);
      message.success('Customer deleted successfully');
      fetchCustomers(); // Refresh the list
    } catch (error) {
      message.error('Failed to delete customer');
      console.error('Error deleting customer:', error);
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Customer, b: Customer) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone No.',
      dataIndex: 'phoneNo',
      key: 'phoneNo',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: Customer) => (
        <Space size="small" className="action-buttons">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditCustomer(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Customer"
            description="Are you sure you want to delete this customer?"
            onConfirm={() => handleDeleteCustomer(record.id!)}
            okText="Yes"
            cancelText="No"
            okType="danger"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="customer-management">
      <Card>
        <div className="customer-management-header">
          <Title level={2} className="customer-management-title">
            Customer Management System
          </Title>

          <div className="customer-management-actions">
            <div className="search-container">
              <Search
                placeholder="Search customers by name, email, phone, or address"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={handleAddCustomer}
              className="add-button"
            >
              Add Customer
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} customers`,
          }}
          className="customer-table"
          scroll={{ x: 800 }}
        />

        {/* Add/Edit Customer Modal */}
        <Modal
          title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[
                { required: true, message: 'Please enter customer name!' },
                { min: 2, message: 'Name must be at least 2 characters long!' }
              ]}
            >
              <Input placeholder="Enter customer name" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please enter email address!' },
                { type: 'email', message: 'Please enter a valid email address!' }
              ]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phoneNo"
              rules={[
                { required: true, message: 'Please enter phone number!' },
                { pattern: /^[0-9+\-\s]+$/, message: 'Please enter a valid phone number!' }
              ]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>

            <Form.Item
              label="Address"
              name="address"
              rules={[
                { required: true, message: 'Please enter address!' }
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Enter customer address"
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingCustomer ? 'Update Customer' : 'Add Customer'}
                </Button>
                <Button
                  onClick={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default CustomerManagement;
