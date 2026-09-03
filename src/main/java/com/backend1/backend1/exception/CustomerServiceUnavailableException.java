package com.backend1.backend1.exception;

public class CustomerServiceUnavailableException extends RuntimeException {
    public CustomerServiceUnavailableException(Throwable cause) {
        super("Could not reach the customer service", cause);
    }
}
