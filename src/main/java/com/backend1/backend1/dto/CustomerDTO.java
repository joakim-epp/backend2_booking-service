package com.backend1.backend1.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomerDTO {
    private Long id;

    @NotBlank(message = "Förnamn är obligatoriskt")
    private String firstName;

    @NotBlank(message = "Efternamn är obligatoriskt")
    private String lastName;

    private String email;
    private String phone;
    private String address;
    private long bookingCount;

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
