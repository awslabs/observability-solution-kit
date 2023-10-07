package com.amazon.sdk.spring.logging


import org.springframework.core.env.ConfigurableEnvironment
import org.springframework.core.env.MutablePropertySources
import spock.lang.Specification

class CustomEnvironmentPostProcessorTest extends Specification {
    def suite = new CustomEnvironmentPostProcessor()

    def "postProcessEnvironment test"() {
        given:
        def environment = Mock(ConfigurableEnvironment) {
            getProperty(_) >> ENABLE
            getPropertySources() >> new MutablePropertySources()
        }

        when:
        suite.postProcessEnvironment(environment, null)

        then:
        environment.getPropertySources().isEmpty() == EMPTY
        noExceptionThrown()

        where:
        ENABLE  | EMPTY
        "true"  | false
        "false" | true
    }
}
