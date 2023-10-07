package com.amazon.sdk.spring.logging.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;
import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;

@Slf4j
public class TokenDirector {
    private static final String TOKEN_HEADER = "authorization";
    private static final String TOKEN_PREFIX = "Bearer ";

    public static Optional<String> getJwtFromRequest(final HttpServletRequest request) {
        String tokenHeader = request.getHeader(TOKEN_HEADER);
        if (StringUtils.hasText(tokenHeader)) {
            if (tokenHeader.startsWith(TOKEN_PREFIX)) {
                return Optional.of(tokenHeader.replace(TOKEN_PREFIX, ""));
            }
            return Optional.of(tokenHeader);
        }
        List<String> headers = HeaderExtractor.extract(request.getHeaderNames());
        log.warn("[AuthCheck] jwt is empty. url: {}, method: {}, headerNames: {}, jwt : {}", request.getRequestURL(), request.getMethod(), headers, request.getHeaderNames());
        return Optional.empty();
    }
}
