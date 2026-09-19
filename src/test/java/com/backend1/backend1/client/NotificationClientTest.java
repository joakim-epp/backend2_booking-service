package com.backend1.backend1.client;

import com.backend1.backend1.model.Booking;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class NotificationClientTest {

    @Test
    void startsWithoutNotificationConfiguration() {
        RestClient restClient = mock(RestClient.class);
        new ApplicationContextRunner()
                .withBean(RestClient.class, () -> restClient)
                .withUserConfiguration(NotificationClient.class)
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    context.getBean(NotificationClient.class).bookingConfirmed(booking());
                    verifyNoInteractions(restClient);
                });
    }

    @ParameterizedTest
    @ValueSource(strings = {"", " \t "})
    void blankUrlSkipsHttpCalls(String url) {
        RestClient restClient = mock(RestClient.class);
        new NotificationClient(restClient, url).bookingConfirmed(booking());
        verifyNoInteractions(restClient);
    }

    @Test
    void configuredUrlSendsBookingConfirmation() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo("http://notification-service/api/notifications"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(jsonPath("$.customerId").value(7))
                .andExpect(jsonPath("$.bookingId").value(42))
                .andRespond(withSuccess());

        new NotificationClient(builder.build(), "http://notification-service")
                .bookingConfirmed(booking());

        server.verify();
    }

    @Test
    void unavailableNotificationServiceDoesNotFailBooking() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo("http://notification-service/api/notifications"))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));
        NotificationClient client = new NotificationClient(builder.build(), "http://notification-service");

        assertThatCode(() -> client.bookingConfirmed(booking())).doesNotThrowAnyException();
        server.verify();
    }

    private Booking booking() {
        Booking booking = new Booking();
        booking.setId(42L);
        booking.setCustomerId(7L);
        booking.setCheckIn(LocalDate.of(2026, 10, 1));
        booking.setCheckOut(LocalDate.of(2026, 10, 3));
        return booking;
    }
}
