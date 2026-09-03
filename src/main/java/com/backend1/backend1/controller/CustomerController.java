package com.backend1.backend1.controller;

import com.backend1.backend1.client.CustomerClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * The customer pages of the frontend still live here, but every call is relayed to the customer
 * service. No customer data is stored or interpreted on this side.
 */
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerClient customerClient;

    @GetMapping
    public ResponseEntity<String> list() {
        return customerClient.forward(HttpMethod.GET, "/api/customers", null);
    }

    @GetMapping("/{id}")
    public ResponseEntity<String> get(@PathVariable Long id) {
        return customerClient.forward(HttpMethod.GET, "/api/customers/" + id, null);
    }

    @PostMapping
    public ResponseEntity<String> create(@RequestBody String body) {
        return customerClient.forward(HttpMethod.POST, "/api/customers", body);
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> update(@PathVariable Long id, @RequestBody String body) {
        return customerClient.forward(HttpMethod.PUT, "/api/customers/" + id, body);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return customerClient.forward(HttpMethod.DELETE, "/api/customers/" + id, null);
    }
}
