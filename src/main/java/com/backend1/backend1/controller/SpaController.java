package com.backend1.backend1.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    // React router owns these paths; hand them the built index.html.
    @GetMapping({"/", "/customers/**", "/rooms/**", "/bookings/**"})
    public String spa() {
        return "forward:/index.html";
    }
}
