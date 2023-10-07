//file:noinspection GroovyPointlessBoolean
package com.amazon.sdk.spring.logging.interceptor

import org.springframework.web.servlet.ModelAndView
import spock.lang.Specification
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class LoggingContextInterceptorTest extends Specification {
    def suite = new LoggingContextInterceptor()
    def request = Mock(HttpServletRequest)
    def response = Mock(HttpServletResponse)

    def "preHandle request method 가 OPTION 일때"() {
        given:
        request.getMethod() >> "OPTIONS"

        when:
        suite.preHandle(request, response, null) == true

        then:
        0 * request.getRequestURI()
    }

    def "preHandle common test"() {
        given:
        request.getMethod() >> "GET"

        when:
        suite.preHandle(request, response, null) == true

        then:
        1 * request.getRequestURI()
    }

    def "postHandle test"() {
        when:
        suite.postHandle(Mock(HttpServletRequest),Mock(HttpServletResponse),new Object(),new ModelAndView())
        then:
        noExceptionThrown()

    }
}
