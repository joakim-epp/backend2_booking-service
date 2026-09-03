package com.backend1.backend1.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.net.URI;
import java.util.List;
import java.util.Map;

/** Errors are application/problem+json with an errorCode, the same shape the customer service uses. */
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail validationFailed(MethodArgumentNotValidException e, HttpServletRequest request) {
        List<Map<String, String>> errors = e.getBindingResult().getFieldErrors().stream()
                .map(f -> Map.of("field", f.getField(), "message",
                        f.getDefaultMessage() == null ? "Ogiltigt värde" : f.getDefaultMessage()))
                .toList();
        ProblemDetail problem = problem(HttpStatus.BAD_REQUEST, "Formuläret innehåller fel",
                "Ett eller flera fält är ogiltiga", "VALIDATION_FAILED", request);
        problem.setProperty("errors", errors);
        return problem;
    }

    @ExceptionHandler({MethodArgumentTypeMismatchException.class, ConstraintViolationException.class,
            MissingServletRequestParameterException.class, HttpMessageNotReadableException.class})
    ProblemDetail invalidRequest(HttpServletRequest request) {
        return problem(HttpStatus.BAD_REQUEST, "Ogiltig förfrågan", "Ogiltig parameter",
                "INVALID_REQUEST", request);
    }

    @ExceptionHandler(BookingValidationException.class)
    ProblemDetail invalidBooking(BookingValidationException e, HttpServletRequest request) {
        return problem(HttpStatus.BAD_REQUEST, "Ogiltig bokning", e.getMessage(),
                "INVALID_REQUEST", request);
    }

    @ExceptionHandler(NotFoundException.class)
    ProblemDetail notFound(NotFoundException e, HttpServletRequest request) {
        return problem(HttpStatus.NOT_FOUND, "Hittades inte", e.getMessage(), e.getErrorCode(), request);
    }

    @ExceptionHandler(BookingConflictException.class)
    ProblemDetail doubleBooking(BookingConflictException e, HttpServletRequest request) {
        return problem(HttpStatus.CONFLICT, "Rummet är upptaget", e.getMessage(),
                "ROOM_ALREADY_BOOKED", request);
    }

    @ExceptionHandler(IllegalStateException.class)
    ProblemDetail conflict(IllegalStateException e, HttpServletRequest request) {
        return problem(HttpStatus.CONFLICT, "Kan inte utföras", e.getMessage(),
                "ROOM_HAS_BOOKINGS", request);
    }

    @ExceptionHandler(CustomerServiceUnavailableException.class)
    ResponseEntity<ProblemDetail> customerServiceUnavailable(HttpServletRequest request) {
        ProblemDetail problem = problem(HttpStatus.SERVICE_UNAVAILABLE, "Tjänsten är inte tillgänglig just nu",
                "Vi kunde inte hantera din bokning just nu, försök igen senare",
                "CUSTOMER_SERVICE_UNAVAILABLE", request);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .header(HttpHeaders.RETRY_AFTER, "5")
                .body(problem);
    }

    private ProblemDetail problem(HttpStatus status, String title, String detail,
                                  String errorCode, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(title);
        problem.setType(URI.create("/problems/" + errorCode.toLowerCase().replace('_', '-')));
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("errorCode", errorCode);
        return problem;
    }
}
