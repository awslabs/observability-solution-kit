//file:noinspection GroovyPointlessBoolean
package com.amazon.sdk.spring.logging.service

import com.amazon.sdk.spring.logging.message.LogAttributeDirector
import org.slf4j.MDC
import spock.lang.Specification

class MdcDirectorTest extends Specification {
    def MAP_FROM_CONTEXT = [
            "tenantContext.organizationName" : "organizationNameValue",
            "tenantContext.industry"         : "industryValue",
            "traceId"                        : "traceIdValue",
            "tenantContext.organizationId"   : "organizationIdValue",
            "tenantContext.businessType"     : "businessTypeValue",
            "requestId"                      : "requestIdValue",
            "userContext.userId"             : "userIdValue",
            "tenantContext.country"          : "countryValue"
    ]

    def cleanup() {
        MDC.clear()
    }

    def "init test"() {
        expect:
        MdcDirector.init(MAP_FROM_CONTEXT)
        MDC.get("tenantContext.organizationName") == "organizationNameValue"
        MDC.get("tenantContext.industry" )        == "industryValue"
        MDC.get("traceId" )                       == "traceIdValue"
        MDC.get("tenantContext.organizationId" )  == "organizationIdValue"
        MDC.get("tenantContext.businessType")     == "businessTypeValue"
        MDC.get("requestId" )                     == "requestIdValue"
        MDC.get("userContext.userId")             == "userIdValue"
        MDC.get("tenantContext.country" )         == "countryValue"
    }

    def "updateCustomDataToMap test"() {
        expect:
        MdcDirector.init(MAP_FROM_CONTEXT)
        Map<String, Object> finalResultMap = [:]
        MdcDirector.updateCustomDataToMap(finalResultMap)
        finalResultMap.isEmpty() == false
        finalResultMap.toString() == "[tenantContext:[organizationId:organizationIdValue, country:countryValue, " +
                "organizationName:organizationNameValue, industry:industryValue, businessType:businessTypeValue], " +
                "traceId:traceIdValue, requestId:requestIdValue, userContext:[userId:userIdValue]]"
    }

    def "loadFromMergedLogAttributes test"() {
        expect:
        def data = "{\"tenantContext\":{\"organizationName\":\"organizationNameValue\",\"industry\":\"industryValue\",\"organizationId\":\"organizationIdValue\",\"businessType\":\"businessTypeValue\",\"country\":\"countryValue\"},\"traceId\":\"traceIdValue\",\"requestId\":\"requestIdValue\",\"userContext\":{\"userId\":\"userIdValue\"}}"
        def jsonNode = LogAttributeDirector.load(Optional.of(data))
        MdcDirector.loadFromMergedLogAttributes(jsonNode)

        MDC.get("tenantContext.organizationName") == "organizationNameValue"
        MDC.get("tenantContext.industry" )        == "industryValue"
        MDC.get("traceId" )                       == "traceIdValue"
        MDC.get("tenantContext.organizationId" )  == "organizationIdValue"
        MDC.get("tenantContext.businessType")     == "businessTypeValue"
        MDC.get("requestId" )                     == "requestIdValue"
        MDC.get("userContext.userId")             == "userIdValue"
        MDC.get("tenantContext.country" )         == "countryValue"

    }
}
