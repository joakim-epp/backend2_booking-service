package com.backend1.backend1.service;

import com.backend1.backend1.client.CustomerClient;
import com.backend1.backend1.client.NotificationClient;
import com.backend1.backend1.dto.BookingDTO;
import com.backend1.backend1.exception.BookingConflictException;
import com.backend1.backend1.exception.BookingValidationException;
import com.backend1.backend1.exception.NotFoundException;
import com.backend1.backend1.model.Booking;
import com.backend1.backend1.model.Room;
import com.backend1.backend1.repository.BookingRepository;
import com.backend1.backend1.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BookingService {

    /** The container runs in UTC. "Today" for a Swedish guesthouse is the Swedish date. */
    private static final ZoneId STOCKHOLM = ZoneId.of("Europe/Stockholm");

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final CustomerClient customerClient;
    private final NotificationClient notificationClient;

    public List<BookingDTO> findAll() {
        List<Booking> bookings = bookingRepository.findAll();
        Map<Long, String> names = customerClient.names(bookings.stream().map(Booking::getCustomerId).toList());
        return bookings.stream().map(b -> toDTO(b, names)).toList();
    }

    /** Bookings the guest has not checked out from yet. The customer service asks before deleting a customer. */
    public long countActive(Long customerId) {
        return bookingRepository.countByCustomerIdAndCheckOutGreaterThanEqual(customerId, LocalDate.now(STOCKHOLM));
    }

    public BookingDTO findById(Long id) {
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Bokning med id " + id + " hittades inte", "BOOKING_NOT_FOUND"));
        return toDTO(b, customerClient.names(List.of(b.getCustomerId())));
    }

    /**
     * Not @Transactional on purpose: the customer check is an HTTP call, and a transaction around it
     * would hold a pooled connection while waiting. The repository save runs in its own transaction.
     */
    public BookingDTO save(Long bookingId, Long customerId, Long roomId,
                           LocalDate checkIn, LocalDate checkOut, int numberOfGuests) {
        if (!checkOut.isAfter(checkIn)) {
            throw new BookingValidationException("Utcheckningsdatum måste vara efter incheckningsdatum");
        }
        if (bookingId != null && !bookingRepository.existsById(bookingId)) {
            throw new NotFoundException("Bokning med id " + bookingId + " hittades inte", "BOOKING_NOT_FOUND");
        }
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new NotFoundException("Rum med id " + roomId + " hittades inte", "ROOM_NOT_FOUND"));
        if (room.getCapacity() < numberOfGuests) {
            int capacity = room.getCapacity();
            throw new BookingValidationException("Rummet har plats för " + capacity
                    + (capacity == 1 ? " person" : " personer") + ", inte " + numberOfGuests);
        }
        if (!customerClient.exists(customerId)) {
            throw new NotFoundException("Kund med id " + customerId + " hittades inte", "CUSTOMER_NOT_FOUND");
        }
        long overlaps = bookingId == null
                ? bookingRepository.countByRoomIdAndCheckInBeforeAndCheckOutAfter(roomId, checkOut, checkIn)
                : bookingRepository.countByRoomIdAndCheckInBeforeAndCheckOutAfterAndIdNot(roomId, checkOut, checkIn, bookingId);
        if (overlaps > 0) {
            throw new BookingConflictException("Rummet är redan bokat för de valda datumen");
        }
        Booking b = new Booking();
        b.setId(bookingId);
        b.setCustomerId(customerId);
        b.setRoom(room);
        b.setCheckIn(checkIn);
        b.setCheckOut(checkOut);
        b.setNumberOfGuests(numberOfGuests);
        Booking saved = bookingRepository.save(b);
        if (bookingId == null) {
            notificationClient.bookingConfirmed(saved);
        }
        return toDTO(saved, customerClient.names(List.of(customerId)));
    }

    public void delete(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new NotFoundException("Bokning med id " + id + " hittades inte", "BOOKING_NOT_FOUND");
        }
        bookingRepository.deleteById(id);
    }

    public long count() {
        return bookingRepository.count();
    }

    private BookingDTO toDTO(Booking b, Map<Long, String> names) {
        BookingDTO dto = new BookingDTO();
        dto.setId(b.getId());
        dto.setCustomerId(b.getCustomerId());
        dto.setCustomerFullName(names.getOrDefault(b.getCustomerId(), "Kund #" + b.getCustomerId()));
        if (b.getRoom() != null) {
            dto.setRoomId(b.getRoom().getId());
            dto.setRoomNumber(b.getRoom().getRoomNumber());
            dto.setRoomTypeDisplayName(b.getRoom().getType() != null
                    ? b.getRoom().getType().getDisplayName() : "");
            dto.setPricePerNight(b.getRoom().getPricePerNight());
        }
        dto.setCheckIn(b.getCheckIn());
        dto.setCheckOut(b.getCheckOut());
        dto.setNumberOfGuests(b.getNumberOfGuests());
        return dto;
    }
}
