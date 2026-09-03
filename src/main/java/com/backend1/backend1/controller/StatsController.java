package com.backend1.backend1.controller;

import com.backend1.backend1.service.BookingService;
import com.backend1.backend1.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class StatsController {

    private final RoomService roomService;
    private final BookingService bookingService;

    @GetMapping("/api/stats")
    public Map<String, Long> stats() {
        return Map.of(
                "roomCount", roomService.count(),
                "bookingCount", bookingService.count());
    }
}
