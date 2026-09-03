package com.backend1.backend1.controller;

import com.backend1.backend1.dto.CustomerDTO;
import com.backend1.backend1.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public List<CustomerDTO> list() {
        return customerService.findAll();
    }

    @GetMapping("/{id}")
    public CustomerDTO get(@PathVariable Long id) {
        return customerService.findById(id);
    }

    @PostMapping
    public void create(@Valid @RequestBody CustomerDTO customer) {
        customer.setId(null);
        customerService.save(customer);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @Valid @RequestBody CustomerDTO customer) {
        customer.setId(id);
        customerService.save(customer);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        customerService.delete(id);
    }
}
