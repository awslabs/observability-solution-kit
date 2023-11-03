package org.ollyv.spring.logging.configuration

import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import spock.lang.Specification

class WebMvcConfigTest extends Specification {
    def suite = new WebMvcConfig()

    def "addInterceptors 테스트"() {
        given:
        def registry = new InterceptorRegistry()
        when:
        suite.addInterceptors(registry)
        then:
        noExceptionThrown()
    }
}
