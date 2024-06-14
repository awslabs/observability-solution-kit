package org.ollyv.spring.logging.configuration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
public class IsWebApplicationCondition implements Condition {
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        ConfigurableListableBeanFactory beanFactory = context.getBeanFactory();
        if (beanFactory == null) {
            log.warn("Cannot load bean factory");
            return false;
        }

        String[] restControllerBeans = beanFactory.getBeanNamesForAnnotation(RestController.class);
        String[] controllerBeans = beanFactory.getBeanNamesForAnnotation(Controller.class);
        return restControllerBeans.length !=0 || controllerBeans.length != 0;
    }
}
