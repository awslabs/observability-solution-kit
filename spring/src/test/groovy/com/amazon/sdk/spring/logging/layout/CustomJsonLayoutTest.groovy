//file:noinspection GroovyPointlessBoolean
//file:noinspection GroovyAccessibility
package com.amazon.sdk.spring.logging.layout

import ch.qos.logback.classic.spi.ILoggingEvent
import org.slf4j.MDC
import spock.lang.Specification

class CustomJsonLayoutTest extends Specification {
    def suite = new CustomJsonLayout()

    def cleanupSpec() {
        MDC.clear()
    }

    def "addCustomDataToJsonMap 테스트"() {
        def map = ["mdc":"dummy"]
        def event = Mock(ILoggingEvent) {
            getLoggerName() >> "com.amazon.logger.Service"
        }

        when:
        suite.addCustomDataToJsonMap(map, event)

        then:
        // excludeNotUsedField
        suite.isIncludeThreadName()  == false
        suite.isIncludeLoggerName()  == false
        suite.isIncludeContextName() == false

        map.get(CustomJsonLayout.CALLER_ATTR_NAME) == "ecs:com.amazon.logger.Service"

        // remove mdc field
        map.get("mdc") == null
    }
}
