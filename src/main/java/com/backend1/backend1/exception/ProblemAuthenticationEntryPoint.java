package com.backend1.backend1.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/** Same 401 body as the customer service, so the frontend can treat both alike. */
@Component
public class ProblemAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("""
                {
                  "type": "/problems/unauthorized",
                  "title": "Authentication required",
                  "status": 401,
                  "detail": "Du måste logga in för att göra det här",
                  "instance": "%s",
                  "errorCode": "UNAUTHORIZED"
                }
                """.formatted(request.getRequestURI()));
    }
}
