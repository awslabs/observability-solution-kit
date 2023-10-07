//file:noinspection GroovyPointlessBoolean
package com.amazon.sdk.spring.logging.service

import spock.lang.Specification

class DynamicTenantContextFieldMakerTest extends Specification {
    def suite = new DynamicTenantContextFieldMaker()

    def "sourceAndDestination test"() {
        expect:
        def result = suite.sourceAndDestination()
        result.isEmpty()                                == false
        result.get("organizations[0].organizationName") == "tenantContext.organizationName"
        result.get("organizations[0].industry")         == "tenantContext.industry"
        result.get("traceId")                           == "traceId"
        result.get("organizations[0].organizationId")   == "tenantContext.organizationId"
        result.get("organizations[0].businessType")     == "tenantContext.businessType"
        result.get("requestId")                         == "requestId"
        result.get("user.userId")                       == "userContext.userId"
        result.get("organizations[0].country")          == "tenantContext.country"
    }

    def "destinationKeys test"() {
        def result = suite.sourceAndDestination()
        result.isEmpty()                                          == false
        result.containsKey("tenantContext.organizationName") == true
        result.containsKey("tenantContext.industry")         == true
        result.containsKey("traceId")                        == true
        result.containsKey("tenantContext.organizationId")   == true
        result.containsKey("tenantContext.businessType")     == true
        result.containsKey("requestId")                      == true
        result.containsKey("userContext.userId")             == true
        result.containsKey("tenantContext.country")          == true
    }
}
