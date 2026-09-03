package com.backend1.backend1.client;

import com.backend1.backend1.exception.CustomerServiceUnavailableException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * The booking service's only view of customers. Every call forwards the caller's
 * Authorization header, see RestClientConfig.
 */
@Slf4j
@Component
public class CustomerClient {

    /** The customer service rejects batch lookups with more ids than this. */
    private static final int BATCH_SIZE = 100;

    private final RestClient restClient;
    private final String baseUrl;

    public CustomerClient(RestClient restClient, @Value("${customer.service.url}") String baseUrl) {
        this.restClient = restClient;
        this.baseUrl = baseUrl;
    }

    /** True when the customer exists and is not deleted. Anything but a clear yes or no is an outage. */
    public boolean exists(Long customerId) {
        try {
            restClient.get()
                    .uri(baseUrl + "/api/customers/{id}", customerId)
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (HttpClientErrorException.NotFound e) {
            return false;
        } catch (RestClientException e) {
            throw new CustomerServiceUnavailableException(e);
        }
    }

    /**
     * Display names keyed by customer id. A failure here must not take the booking list down,
     * so it degrades to an empty map and the list falls back to showing ids.
     */
    public Map<Long, String> names(Collection<Long> customerIds) {
        List<Long> ids = customerIds.stream().distinct().toList();
        Map<Long, String> names = new HashMap<>();
        try {
            for (int from = 0; from < ids.size(); from += BATCH_SIZE) {
                List<Long> batch = ids.subList(from, Math.min(from + BATCH_SIZE, ids.size()));
                String joined = batch.stream().map(String::valueOf).collect(Collectors.joining(","));
                List<CustomerSummary> customers = restClient.get()
                        .uri(baseUrl + "/api/customers?ids={ids}", joined)
                        .retrieve()
                        .body(new ParameterizedTypeReference<>() {});
                if (customers != null) {
                    customers.forEach(c -> names.put(c.id(), c.displayName()));
                }
            }
        } catch (RestClientException e) {
            log.warn("Kunde inte hämta kundnamn från kundtjänsten: {}", e.getMessage());
        }
        return names;
    }

    /**
     * Pass-through for the customer pages in this service's frontend. The browser only talks to
     * this origin, so the customer service's answer is relayed as-is: same status, same body.
     */
    public ResponseEntity<String> forward(HttpMethod method, String path, String body) {
        try {
            RestClient.RequestBodySpec spec = restClient.method(method).uri(baseUrl + path);
            if (body != null) {
                spec.contentType(MediaType.APPLICATION_JSON).body(body);
            }
            return spec.exchange((request, response) -> {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(response.getHeaders().getContentType());
                return ResponseEntity.status(response.getStatusCode())
                        .headers(headers)
                        .body(response.bodyTo(String.class));
            });
        } catch (RestClientException e) {
            throw new CustomerServiceUnavailableException(e);
        }
    }
}
