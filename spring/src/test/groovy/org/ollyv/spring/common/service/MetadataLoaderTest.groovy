package org.ollyv.spring.common.service

import org.springframework.core.env.Environment
import spock.lang.Specification

class MetadataLoaderTest extends Specification {
    def "getServiceName 테스트"() {
        given:
        def resultServiceName = "testServiceName"
        def environment = Mock(Environment) {
            getProperty(_,_) >> resultServiceName
        }
        expect:
        MetadataLoader.getServiceName(environment) == resultServiceName
    }
}
