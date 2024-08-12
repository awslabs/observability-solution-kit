package com.amazon.sdk.spring;

import com.amazon.sdk.spring.logging.configuration.IsWebApplicationCondition;
import com.amazon.sdk.spring.logging.configuration.WebMvcConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Slf4j
@Configuration
@ConfigurationPropertiesScan
@AutoConfigureAfter(WebMvcAutoConfiguration.class)
@ComponentScan(basePackages = "com.amazon.sdk.spring")
public class SaasModuleAutoConfiguration {

    @Bean
    @Conditional(IsWebApplicationCondition.class)
    @ConditionalOnProperty("saas.observability.logging.enable")
    public WebMvcConfigurer webMvcConfigurer() {
        log.info("SaaS logging interceptor will be initialized : v22");
        return new WebMvcConfig();
    }
}
