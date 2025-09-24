import axios from 'axios';

// Base URL for your Spring Boot backend API
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/customers`
  : '/api/customers';

// Customer interface to match your backend entity
export interface Customer {
  id?: number;
  name: string;
  address: string;
  phoneNo: string;
  email: string;
  verificationStatus?: string;
}

// Status options for verification
export const VERIFICATION_STATUS_OPTIONS = [
  'Not Verified',
  'Verified', 
  'Fraud', 
  'Suspicious', 
  'Black Listed'
] as const;

export type VerificationStatus = typeof VERIFICATION_STATUS_OPTIONS[number];

// API service class
class CustomerService {
  // GET - Get all customers
  getAllCustomers() {
    return axios.get<Customer[]>(API_BASE_URL);
  }

  // GET - Get customer by ID
  getCustomerById(id: number) {
    return axios.get<Customer>(`${API_BASE_URL}/${id}`);
  }

  // POST - Create new customer
  createCustomer(customer: Customer) {
    return axios.post<Customer>(API_BASE_URL, customer);
  }

  // PUT - Update entire customer
  updateCustomer(id: number, customer: Customer) {
    return axios.put<Customer>(`${API_BASE_URL}/${id}`, customer);
  }

  // PATCH - Update customer verification status only
  updateCustomerStatus(id: number, status: VerificationStatus) {
    return axios.patch<Customer>(`${API_BASE_URL}/${id}/status`, { status });
  }

  // DELETE - Delete customer
  deleteCustomer(id: number) {
    return axios.delete(`${API_BASE_URL}/${id}`);
  }
}

export default new CustomerService();
