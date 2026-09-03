package com.backend1.backend1.controller;

import com.backend1.backend1.client.CustomerClient;
import com.backend1.backend1.client.NotificationClient;
import com.backend1.backend1.exception.CustomerServiceUnavailableException;
import com.backend1.backend1.model.Booking;
import com.backend1.backend1.model.Room;
import com.backend1.backend1.model.RoomType;
import com.backend1.backend1.repository.BookingRepository;
import com.backend1.backend1.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Real HTTP calls through security filter, controller, service, repository and database.
 * Only the other services are replaced, at the client boundary.
 */
@SpringBootTest
@AutoConfigureMockMvc
class BookingControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private RoomRepository roomRepository;

    @MockitoBean
    private CustomerClient customerClient;
    @MockitoBean
    private NotificationClient notificationClient;

    private Long roomId;
    private final LocalDate checkIn = LocalDate.now().plusDays(10);
    private final LocalDate checkOut = LocalDate.now().plusDays(12);

    @BeforeEach
    void setUp() {
        bookingRepository.deleteAll();
        roomRepository.deleteAll();
        Room room = new Room();
        room.setRoomNumber("T1");
        room.setType(RoomType.DOUBLE);
        room.setPricePerNight(new BigDecimal("1000"));
        roomId = roomRepository.save(room).getId();

        when(customerClient.exists(anyLong())).thenReturn(true);
        when(customerClient.names(any())).thenReturn(Map.of(1L, "Anna Svensson"));
    }

    private String bookingJson(long customerId) {
        return """
                {"customerId": %d, "roomId": %d, "checkIn": "%s", "checkOut": "%s", "numberOfGuests": 2}
                """.formatted(customerId, roomId, checkIn, checkOut);
    }

    private Booking existingBooking() {
        Booking b = new Booking();
        b.setCustomerId(1L);
        b.setRoom(roomRepository.findById(roomId).orElseThrow());
        b.setCheckIn(checkIn);
        b.setCheckOut(checkOut);
        return bookingRepository.save(b);
    }

    @Test
    void createBookingReturns201AndPersists() throws Exception {
        mockMvc.perform(post("/api/bookings").with(jwt())
                        .contentType(MediaType.APPLICATION_JSON).content(bookingJson(1)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.customerFullName").value("Anna Svensson"))
                .andExpect(jsonPath("$.totalPrice").value(2000));

        assertThat(bookingRepository.findAll())
                .singleElement()
                .satisfies(b -> assertThat(b.getCustomerId()).isEqualTo(1L));
    }

    @Test
    void doubleBookingReturns409() throws Exception {
        existingBooking();

        mockMvc.perform(post("/api/bookings").with(jwt())
                        .contentType(MediaType.APPLICATION_JSON).content(bookingJson(2)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errorCode").value("ROOM_ALREADY_BOOKED"));

        assertThat(bookingRepository.count()).isEqualTo(1);
    }

    @Test
    void unknownCustomerReturns404AndNothingIsSaved() throws Exception {
        when(customerClient.exists(99L)).thenReturn(false);

        mockMvc.perform(post("/api/bookings").with(jwt())
                        .contentType(MediaType.APPLICATION_JSON).content(bookingJson(99)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("CUSTOMER_NOT_FOUND"));

        assertThat(bookingRepository.count()).isZero();
    }

    @Test
    void customerServiceDownReturns503AndNothingIsSaved() throws Exception {
        when(customerClient.exists(anyLong())).thenThrow(new CustomerServiceUnavailableException(null));

        mockMvc.perform(post("/api/bookings").with(jwt())
                        .contentType(MediaType.APPLICATION_JSON).content(bookingJson(1)))
                .andExpect(status().isServiceUnavailable())
                .andExpect(header().string("Retry-After", "5"))
                .andExpect(jsonPath("$.errorCode").value("CUSTOMER_SERVICE_UNAVAILABLE"))
                .andExpect(jsonPath("$.detail").value("Vi kunde inte hantera din bokning just nu, försök igen senare"));

        assertThat(bookingRepository.count()).isZero();
    }

    @Test
    void missingTokenReturns401() throws Exception {
        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON).content(bookingJson(1)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));

        assertThat(bookingRepository.count()).isZero();
    }

    @Test
    void missingFieldsReturn400WithFieldErrors() throws Exception {
        mockMvc.perform(post("/api/bookings").with(jwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roomId\": " + roomId + "}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.errors[*].field").isArray());
    }

    @Test
    void checkOutBeforeCheckInReturns400() throws Exception {
        String json = """
                {"customerId": 1, "roomId": %d, "checkIn": "%s", "checkOut": "%s", "numberOfGuests": 1}
                """.formatted(roomId, checkOut, checkIn);

        mockMvc.perform(post("/api/bookings").with(jwt())
                        .contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("INVALID_REQUEST"));
    }

    @Test
    void deleteReturns204AndRemovesBooking() throws Exception {
        Long id = existingBooking().getId();

        mockMvc.perform(delete("/api/bookings/" + id).with(jwt()))
                .andExpect(status().isNoContent());

        assertThat(bookingRepository.existsById(id)).isFalse();
    }

    @Test
    void deleteUnknownBookingReturns404() throws Exception {
        mockMvc.perform(delete("/api/bookings/999999").with(jwt()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("BOOKING_NOT_FOUND"));
    }

    @Test
    void listReadsWithoutTokenAndShowsCustomerNames() throws Exception {
        existingBooking();

        mockMvc.perform(get("/api/bookings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].customerFullName").value("Anna Svensson"));
    }

    @Test
    void countIsZeroForUnknownCustomerAndCountsActiveBookings() throws Exception {
        existingBooking();

        mockMvc.perform(get("/api/bookings/count").param("customerId", "1").param("status", "ACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(1));

        mockMvc.perform(get("/api/bookings/count").param("customerId", "999999").param("status", "ACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(0));
    }

    @Test
    void countRejectsBadParameters() throws Exception {
        mockMvc.perform(get("/api/bookings/count").param("customerId", "-1").param("status", "ACTIVE"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/bookings/count").param("customerId", "1").param("status", "pending"))
                .andExpect(status().isBadRequest());
    }
}
