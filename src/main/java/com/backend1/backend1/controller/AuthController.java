package com.backend1.backend1.controller;

import com.backend1.backend1.client.CustomerClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Login is the customer service's job. This only lets the frontend reach it from the same origin. */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final CustomerClient customerClient;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody String body) {
        return customerClient.forward(HttpMethod.POST, "/api/auth/login", body);
    }
}
