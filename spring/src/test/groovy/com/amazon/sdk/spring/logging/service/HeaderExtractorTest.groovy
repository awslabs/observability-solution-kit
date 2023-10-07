//file:noinspection GroovyPointlessBoolean
package com.amazon.sdk.spring.logging.service

import spock.lang.Specification

class HeaderExtractorTest extends Specification {

    def "extract test"() {
        expect:
        HeaderExtractor.extract(null).isEmpty() == true

        def headerNames = Collections.enumeration(["headerA", "headerB"])
        def result = HeaderExtractor.extract(headerNames)
        result.isEmpty() == false
    }
}
