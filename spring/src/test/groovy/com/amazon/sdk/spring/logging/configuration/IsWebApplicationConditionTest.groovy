//file:noinspection GroovyPointlessBoolean
package com.amazon.sdk.spring.logging.configuration

import org.springframework.beans.factory.config.ConfigurableListableBeanFactory
import org.springframework.context.annotation.ConditionContext
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RestController
import spock.lang.Specification

class IsWebApplicationConditionTest extends Specification {
    def suite = new IsWebApplicationCondition()

    def "ConfigurableListableBeanFactory is null 테스트"() {
        given:
        def conditionContext = Mock(ConditionContext) {
            getBeanFactory() >> null
        }

        expect:
        suite.matches(conditionContext, null) == false

    }

    def "match test : #TEST_NUM"() {
        given:
        def beanFactory = Mock(ConfigurableListableBeanFactory) {
            getBeanNamesForAnnotation(RestController.class) >> REST_CONTROLLER_NAMES
            getBeanNamesForAnnotation(Controller.class) >> CONTROLLER_NAMES
        }
        def conditionContext = Mock(ConditionContext) {
            getBeanFactory() >> beanFactory
        }

        when:
        def result= suite.matches(conditionContext, null)

        then:
        result == RESULT

        where:
        TEST_NUM | REST_CONTROLLER_NAMES | CONTROLLER_NAMES | RESULT
        1        | []                    | []               | false
        2        | ["aRestController"]   | []               | true
        3        | []                    | ["bController"]  | true
        4        | ["aRestController"]   | ["bController"]  | true
    }

}
