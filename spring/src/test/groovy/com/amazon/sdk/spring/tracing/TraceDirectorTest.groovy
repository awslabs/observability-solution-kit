package com.amazon.sdk.spring.tracing

import com.amazonaws.xray.AWSXRay
import spock.lang.Specification

class TraceDirectorTest extends Specification {
    def "loadTraceId test"() {
        expect:
        TraceDirector.loadTraceId() == "UNKNOWN"

        AWSXRay.beginSegment("START")
        TraceDirector.loadTraceId() != "UNKNOWN"
    }
}
