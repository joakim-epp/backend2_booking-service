package com.backend1.backend1.config;

import com.backend1.backend1.model.Room;
import com.backend1.backend1.model.RoomType;
import com.backend1.backend1.repository.RoomRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/** Seeds the rooms on an empty database. Customers live in the customer service, so no bookings are seeded. */
@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final RoomRepository roomRepository;

    @PostConstruct
    public void init() {
        if (roomRepository.count() > 0) return;

        roomRepository.saveAll(List.of(
            room("101", RoomType.SINGLE, 0, "895"),
            room("102", RoomType.SINGLE, 0, "895"),
            room("103", RoomType.SINGLE, 0, "895"),
            room("104", RoomType.SINGLE, 0, "950"),
            room("201", RoomType.DOUBLE, 0, "1250"),
            room("202", RoomType.DOUBLE, 0, "1250"),
            room("203", RoomType.DOUBLE, 1, "1450"),
            room("204", RoomType.DOUBLE, 1, "1450"),
            room("205", RoomType.DOUBLE, 2, "1650"),
            room("301", RoomType.DOUBLE, 0, "1600"),
            room("302", RoomType.DOUBLE, 1, "1850"),
            room("303", RoomType.DOUBLE, 2, "2100")
        ));
    }

    private Room room(String number, RoomType type, int extraBeds, String price) {
        Room r = new Room();
        r.setRoomNumber(number);
        r.setType(type);
        r.setExtraBeds(extraBeds);
        r.setPricePerNight(new BigDecimal(price));
        return r;
    }
}
