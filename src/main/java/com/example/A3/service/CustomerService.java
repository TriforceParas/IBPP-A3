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

    // Added By : Drithi Chopra
    // Date Added : 2025-08-25
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Optional<Customer> getCustomerById(Long id) {
        return customerRepository.findById(id);
    }

    // Added By : Drithi Chopra
    // Date Added : 2025-08-26
    public Customer createCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    // Added By : Chanchal Sah
    // Date Added : 2025-08-28
    public Optional<Customer> updateCustomer(Long id, Customer customerDetails) {
        return customerRepository.findById(id).map(customer -> {
            customer.setName(customerDetails.getName());
            customer.setAddress(customerDetails.getAddress());
            customer.setPhoneNo(customerDetails.getPhoneNo());
            customer.setEmail(customerDetails.getEmail());
            return customerRepository.save(customer);
        });
    }

    // Added By : Paras Kumar Sharma
    // Date Added : 2025-08-30
    public Optional<Customer> patchCustomer(Long id, Customer customerDetails) {
        return customerRepository.findById(id).map(customer -> {
            if (customerDetails.getName() != null) {
                customer.setName(customerDetails.getName());
            }
            if (customerDetails.getAddress() != null) {
                customer.setAddress(customerDetails.getAddress());
            }
            if (customerDetails.getPhoneNo() != null) {
                customer.setPhoneNo(customerDetails.getPhoneNo());
            }
            if (customerDetails.getEmail() != null) {
                customer.setEmail(customerDetails.getEmail());
            }
            return customerRepository.save(customer);
        });
    }

    // Added By : Ashwani S
    // Date Added : 2025-09-03
    public boolean deleteCustomer(Long id) {
        if (customerRepository.existsById(id)) {
            customerRepository.deleteById(id);
            return true;
        }
        return false;
    }
}