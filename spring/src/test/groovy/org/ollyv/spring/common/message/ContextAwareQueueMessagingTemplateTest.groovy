//file:noinspection GroovyAssignabilityCheck
package org.ollyv.spring.common.message

import com.amazonaws.services.sqs.AmazonSQSAsync
import com.amazonaws.services.sqs.model.GetQueueUrlResult
import org.springframework.core.env.Environment
import org.springframework.messaging.support.GenericMessage
import spock.lang.Specification

class ContextAwareQueueMessagingTemplateTest extends Specification {
    def "send test"() {
        given:
        def amazonSqs = Mock(AmazonSQSAsync) {getQueueUrl(_) >> getDummyQueueUrlResult() }
        def environment = Mock(Environment) {getProperty(_) >> ENABLE }
        def suite = new ContextAwareQueueMessagingTemplate(amazonSqs, environment)

        when:
        def message = new GenericMessage("")
        suite.send("dummyDestinationName", message)

        then:
        noExceptionThrown()

        where:
        DESC      | ENABLE
        "Enable"  | "true"
        "Disable" | "false"

    }

    def "convertAndSend test"() {
        given:
        def amazonSqs = Mock(AmazonSQSAsync) {getQueueUrl(_) >> getDummyQueueUrlResult() }
        def environment = Mock(Environment) {getProperty(_) >> ENABLE }
        def suite = new ContextAwareQueueMessagingTemplate(amazonSqs, environment)

        when:
        def message = new GenericMessage("")
        suite.convertAndSend("dummyDestinationName", message, [:])

        then:
        noExceptionThrown()

        where:
        DESC      | ENABLE
        "Enable"  | true
        "Disable" | false
    }

    def getDummyQueueUrlResult() {
        def getQueueUrlResult = new GetQueueUrlResult()
        getQueueUrlResult.setQueueUrl("dummyQueue")
        return getQueueUrlResult
    }
}
