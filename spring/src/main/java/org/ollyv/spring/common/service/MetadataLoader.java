package org.ollyv.spring.common.service;

import org.springframework.core.env.Environment;

public class MetadataLoader {
    public static String getServiceName(final Environment environment) {
        return environment.getProperty("saas.observability.name", "UNKNOWN");
    }
}
