package com.amazon.sdk.spring.logging.service;

import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.Environment;

public class EnvironmentDirector {
    private static final String ENABLE_CONFIG_KEY = "saas.observability.logging.enable";

    public static boolean isEnabled(ConfigurableEnvironment environment) {
        return Boolean.parseBoolean(environment.getProperty(ENABLE_CONFIG_KEY));
    }

    public static boolean isEnabled(final Environment environment) {
        return Boolean.parseBoolean(environment.getProperty(ENABLE_CONFIG_KEY));
    }
}
