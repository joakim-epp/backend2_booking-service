package com.backend1.backend1.client;

/** The fields of the customer service's customer response that the booking list needs. */
public record CustomerSummary(Long id, String firstName, String lastName, boolean deleted) {

    public String displayName() {
        return firstName + " " + lastName + (deleted ? " (raderad)" : "");
    }
}
