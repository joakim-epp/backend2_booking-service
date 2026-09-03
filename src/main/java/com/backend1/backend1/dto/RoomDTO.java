package com.backend1.backend1.dto;

import com.backend1.backend1.model.RoomType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RoomDTO {
    private Long id;

    @NotBlank(message = "Rumsnummer är obligatoriskt")
    private String roomNumber;

    @NotNull(message = "Rumstyp är obligatorisk")
    private RoomType type;

    @Min(0)
    @Max(2)
    private int extraBeds;

    @NotNull(message = "Pris är obligatoriskt")
    @DecimalMin(value = "0.01", message = "Priset måste vara större än 0")
    private BigDecimal pricePerNight;

    private int capacity;
    private String typeDescription;
    private String typeDisplayName;
}
