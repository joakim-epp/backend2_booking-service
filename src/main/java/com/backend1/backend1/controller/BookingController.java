package com.backend1.backend1.controller;

import com.backend1.backend1.dto.BookingDTO;
import com.backend1.backend1.exception.BookingValidationException;
import com.backend1.backend1.service.BookingService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@Validated
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    public List<BookingDTO> list() {
        return bookingService.findAll();
    }

    /** Contract with the customer service: always 200 for a valid id, count 0 for an unknown customer. */
    @GetMapping("/count")
    public Map<String, Long> count(@RequestParam @Positive Long customerId, @RequestParam String status) {
        if (!"ACTIVE".equals(status)) {
            throw new BookingValidationException("status måste vara ACTIVE");
        }
        return Map.of("count", bookingService.countActive(customerId));
    }

    @GetMapping("/{id}")
    public BookingDTO get(@PathVariable Long id) {
        return bookingService.findById(id);
    }

    @PostMapping
    public ResponseEntity<BookingDTO> create(@Valid @RequestBody BookingDTO booking) {
        BookingDTO created = save(null, booking);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(created.getId()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public BookingDTO update(@PathVariable Long id, @Valid @RequestBody BookingDTO booking) {
        return save(id, booking);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        bookingService.delete(id);
    }

    private BookingDTO save(Long id, BookingDTO b) {
        return bookingService.save(id, b.getCustomerId(), b.getRoomId(),
                b.getCheckIn(), b.getCheckOut(), b.getNumberOfGuests());
    }
}
