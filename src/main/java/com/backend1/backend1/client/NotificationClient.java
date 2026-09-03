package com.backend1.backend1.client;

import com.backend1.backend1.model.Booking;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;

/**
 * Asks the notification service to log a booking confirmation. Best effort: the booking is
 * already stored, and a missing confirmation is not a reason to fail it.
 */
@Slf4j
@Component
public class NotificationClient {

    private final RestClient restClient;
    private final String baseUrl;

    public NotificationClient(RestClient restClient, @Value("${notification.service.url}") String baseUrl) {
        this.restClient = restClient;
        this.baseUrl = baseUrl;
    }

    public void bookingConfirmed(Booking booking) {
        try {
            restClient.post()
                    .uri(baseUrl + "/api/notifications")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "customerId", booking.getCustomerId(),
                            "bookingId", booking.getId(),
                            "checkIn", booking.getCheckIn(),
                            "checkOut", booking.getCheckOut()))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            log.warn("Bokningsbekräftelse för bokning {} kunde inte skickas: {}", booking.getId(), e.getMessage());
        }
    }
}
