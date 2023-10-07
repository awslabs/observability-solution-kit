package com.amazon.sdk.spring

import spock.lang.Specification

class SaasModuleAutoConfigurationTest extends Specification {
    def "webMvcConfigurer test"() {
        expect:
        def suite = new SaasModuleAutoConfiguration()
        suite.webMvcConfigurer() != null
    }
}
