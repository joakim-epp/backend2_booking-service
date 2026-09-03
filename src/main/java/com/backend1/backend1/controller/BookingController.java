package com.backend1.backend1.controller;

import com.backend1.backend1.dto.BookingDTO;
import com.backend1.backend1.exception.BookingValidationException;
import com.backend1.backend1.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    public List<BookingDTO> list() {
        return bookingService.findAll();
    }

    @GetMapping("/count")
    public Map<String, Long> count(@RequestParam Long customerId, @RequestParam String status) {
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
    public void create(@Valid @RequestBody BookingDTO booking) {
        save(null, booking);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @Valid @RequestBody BookingDTO booking) {
        save(id, booking);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        bookingService.delete(id);
    }

    private void save(Long id, BookingDTO b) {
        bookingService.save(id, b.getCustomerId(), b.getRoomId(),
                b.getCheckIn(), b.getCheckOut(), b.getNumberOfGuests());
    }
}
