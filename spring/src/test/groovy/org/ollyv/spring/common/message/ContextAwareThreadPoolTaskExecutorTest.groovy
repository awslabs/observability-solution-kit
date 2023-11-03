package org.ollyv.spring.common.message


import org.springframework.core.env.Environment
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor
import spock.lang.Specification

import java.util.concurrent.Callable

class ContextAwareThreadPoolTaskExecutorTest extends Specification {
    def "taskDecorator test"() {
        given:
        def executor = new ThreadPoolTaskExecutor()
        def environment = Mock(Environment) {
            getProperty(_) >> "true"
            getProperty("saas.observability.name",_) >> "dummyServiceName"
        }
        def suite = new ContextAwareThreadPoolTaskExecutor(executor, environment)

        when:
        suite.submit([:], () -> {})
        suite.execute([:], () -> {})
        suite.execute(["logAttributes":"{}"], () -> {})
        suite.submit(new Callable<String>() {
            @Override
            String call() throws Exception {
                return "done"
            }
        })
        suite.execute(() -> {}, 1000)

        then:
        noExceptionThrown()
    }

    def "taskDecorator test"() {
        given:
        def executor = new ThreadPoolTaskExecutor()
        def environment = Mock(Environment) {
            getProperty(_) >> "true"
            getProperty("saas.observability.name",_) >> "dummyServiceName"
        }
        def suite = new ContextAwareThreadPoolTaskExecutor(executor, environment)

        when:
        suite.submit([:], () -> {})
        suite.execute([:], () -> {})
        suite.execute(["logAttributes":"{}"], () -> {})
        suite.submit(new Callable<String>() {
            @Override
            String call() throws Exception {
                return "done"
            }
        })
        suite.execute(() -> {}, 1000)

        then:
        noExceptionThrown()
    }
}
