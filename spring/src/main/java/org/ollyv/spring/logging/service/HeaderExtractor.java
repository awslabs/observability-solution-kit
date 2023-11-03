package org.ollyv.spring.logging.service;

import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

public class HeaderExtractor {
    public static List<String> extract(final Enumeration<String> headerNames) {
        List<String> headers = new ArrayList<>();
        if (headerNames == null) {
            return headers;
        }
        headerNames.asIterator().forEachRemaining(headers::add);
        return headers;
    }
}
