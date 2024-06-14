package org.ollyv.spring.logging.service

import org.springframework.core.env.ConfigurableEnvironment
import org.springframework.core.env.Environment
import spock.lang.Specification

class EnvironmentDirectorTest extends Specification {

    def "ConfigurableEnvironment enable 테스트"() {
        given:
        def environment = Mock(ENVIRONMENT_TYPE) {
            getProperty(_) >> PROPERTY
        }

        expect:
        EnvironmentDirector.isEnabled(environment) == RESULT

        where:
        ENVIRONMENT_TYPE        | PROPERTY | RESULT
        ConfigurableEnvironment | "true"   | true
        ConfigurableEnvironment | "false"  | false
        ConfigurableEnvironment | ""       | false
        ConfigurableEnvironment | null     | false
        Environment             | "true"   | true
        Environment             | "false"  | false
        Environment             | ""       | false
        Environment             | null     | false
    }

}
