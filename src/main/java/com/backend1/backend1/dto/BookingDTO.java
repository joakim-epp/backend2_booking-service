package com.backend1.backend1.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Data
public class BookingDTO {
    private Long id;

    @NotNull(message = "Kund är obligatorisk")
    private Long customerId;

    private String customerFullName;

    @NotNull(message = "Rum är obligatoriskt")
    private Long roomId;

    private String roomNumber;
    private String roomTypeDisplayName;
    private BigDecimal pricePerNight;

    @NotNull(message = "Incheckning är obligatorisk")
    private LocalDate checkIn;

    @NotNull(message = "Utcheckning är obligatorisk")
    private LocalDate checkOut;

    @Min(value = 1, message = "Minst 1 gäst krävs")
    private int numberOfGuests = 1;

    public long getNights() {
        return checkIn != null && checkOut != null ? ChronoUnit.DAYS.between(checkIn, checkOut) : 0;
    }

    public BigDecimal getTotalPrice() {
        return pricePerNight != null ? pricePerNight.multiply(BigDecimal.valueOf(getNights())) : BigDecimal.ZERO;
    }
}
