package org.ollyv.spring.logging.configuration;

import org.ollyv.spring.logging.interceptor.LoggingContextInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.util.List;

public class WebMvcConfig implements WebMvcConfigurer {
    private static final int ORDER_999 = 999;
    private static final List<String> excludePath = List.of(
            "/version", "/time", "/auth/token"
    );

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        WebMvcConfigurer.super.addInterceptors(registry);
        registry.addInterceptor(new LoggingContextInterceptor())
                .excludePathPatterns(excludePath)
                .order(ORDER_999);
    }
}
