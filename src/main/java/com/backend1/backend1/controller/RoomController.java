package com.backend1.backend1.controller;

import com.backend1.backend1.dto.RoomDTO;
import com.backend1.backend1.model.RoomType;
import com.backend1.backend1.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public List<RoomDTO> list() {
        return roomService.findAll();
    }

    @GetMapping("/types")
    public List<Map<String, String>> types() {
        return Arrays.stream(RoomType.values())
                .map(t -> Map.of("name", t.name(), "displayName", t.getDisplayName()))
                .toList();
    }

    @GetMapping("/available")
    public List<RoomDTO> available(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(defaultValue = "1") int numberOfGuests) {
        return roomService.findAvailableByDates(checkIn, checkOut, numberOfGuests);
    }

    @GetMapping("/{id}")
    public RoomDTO get(@PathVariable Long id) {
        return roomService.findById(id);
    }

    @PostMapping
    public void create(@Valid @RequestBody RoomDTO room) {
        room.setId(null);
        roomService.save(room);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @Valid @RequestBody RoomDTO room) {
        room.setId(id);
        roomService.save(room);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        roomService.delete(id);
    }
}
