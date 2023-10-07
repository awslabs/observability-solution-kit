package com.amazon.sdk.spring.logging.service

import spock.lang.Specification

import javax.servlet.http.HttpServletRequest

class TokenDirectorTest extends Specification {
    def "getJwtFromRequest test"() {
        given:
        def request = Mock(HttpServletRequest) {
            getHeader(_) >> TOKEN_HEADER
            getHeaderNames() >> Collections.enumeration([])
        }

        expect:
        def result = TokenDirector.getJwtFromRequest(request)
        result.isPresent() == IS_PRESENT
        result.orElse("") == JWT_SAMPLE

        where:
        TOKEN_HEADER    | IS_PRESENT | JWT_SAMPLE
        "Bearer aabbcc" | true       | "aabbcc"
        "aabbcc"        | true       | "aabbcc"
        ""              | false      | ""
        null            | false      | ""
    }
}
