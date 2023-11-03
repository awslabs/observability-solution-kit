package org.ollyv.spring.logging;

import org.ollyv.spring.logging.service.EnvironmentDirector;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import java.util.HashMap;
import java.util.Map;

public class CustomEnvironmentPostProcessor implements EnvironmentPostProcessor {
    private static final String CUSTOM_PROPERTIES = "customProperties";
    private static final String CUSTOM_LOGBACK_CONFIG_KEY = "logging.config";
    private static final String CUSTOM_LOGBACK_CONFIG_PATH = "classpath:logback-custom.xml";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        if (EnvironmentDirector.isEnabled(environment)) {
            Map<String, Object> customPropertyMap = new HashMap<>();
            customPropertyMap.put(CUSTOM_LOGBACK_CONFIG_KEY, CUSTOM_LOGBACK_CONFIG_PATH);
            environment.getPropertySources().addLast(new MapPropertySource(CUSTOM_PROPERTIES,customPropertyMap));
        }
    }
}
