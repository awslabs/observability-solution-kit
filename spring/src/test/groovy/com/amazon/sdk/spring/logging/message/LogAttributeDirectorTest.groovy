//file:noinspection GroovyPointlessBoolean
//file:noinspection GroovyAccessibility
package com.amazon.sdk.spring.logging.message

import spock.lang.Specification

class LogAttributeDirectorTest extends Specification {
    def MADE_RESULT_FORMAT = "{\n" +
            "  \"tenantContext\" : {\n" +
            "    \"organizationName\" : \"unknown\",\n" +
            "    \"industry\" : \"unknown\",\n" +
            "    \"organizationId\" : \"unknown\",\n" +
            "    \"businessType\" : \"unknown\",\n" +
            "    \"country\" : \"unknown\"\n" +
            "  },\n" +
            "  \"traceId\" : \"unknown\",\n" +
            "  \"requestId\" : \"unknown\",\n" +
            "  \"userContext\" : {\n" +
            "    \"userId\" : \"unknown\"\n" +
            "  }\n" +
            "}"
    def MADE_ERROR_RESULT_FORMAT = "{ aaa:}"

    def "make test"() {
        expect:
        def result = LogAttributeDirector.make()
        result.isBlank() == false
        result           == MADE_RESULT_FORMAT
    }

    def "load test"() {
        expect:
        LogAttributeDirector.load(Optional.empty()).toString() == "{}"

        def result = LogAttributeDirector.load(Optional.of(MADE_RESULT_FORMAT))
        result.toString() == "{\"tenantContext\":{\"organizationName\":\"unknown\",\"industry\":\"unknown\",\"organizationId\":\"unknown\",\"businessType\":\"unknown\",\"country\":\"unknown\"},\"traceId\":\"unknown\",\"requestId\":\"unknown\",\"userContext\":{\"userId\":\"unknown\"}}"
    }

    def "load error test"() {
        expect:
        def result = LogAttributeDirector.load(Optional.of(MADE_ERROR_RESULT_FORMAT))
        result.toString() == "{}"
    }
}
