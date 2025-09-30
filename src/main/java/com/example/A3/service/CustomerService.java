package com.example.A3.service;

import com.example.A3.entity.Customer;
import com.example.A3.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Optional<Customer> getCustomerById(Long id) {
        return customerRepository.findById(id);
    }

    public Customer createCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    public Optional<Customer> updateCustomer(Long id, Customer customerDetails) {
        return customerRepository.findById(id).map(customer -> {
            customer.setName(customerDetails.getName());
            customer.setAddress(customerDetails.getAddress());
            customer.setPhoneNo(customerDetails.getPhoneNo());
            customer.setEmail(customerDetails.getEmail());
            return customerRepository.save(customer);
        });
    }

    public Optional<Customer> updateCustomerStatus(Long id, String status) {
        return customerRepository.findById(id).map(customer -> {
            customer.setVerificationStatus(status);
            return customerRepository.save(customer);
        });
    }

    public boolean deleteCustomer(Long id) {
        if (customerRepository.existsById(id)) {
            customerRepository.deleteById(id);
            return true;
        }
        return false;
    }
}