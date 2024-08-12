package com.amazon.sdk.spring.common.message;

import com.amazon.sdk.spring.logging.message.LogAttributeDirector;
import com.amazon.sdk.spring.logging.service.EnvironmentDirector;
import com.amazonaws.services.sqs.AmazonSQSAsync;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.aws.messaging.core.QueueMessagingTemplate;
import org.springframework.core.env.Environment;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.support.MessageBuilder;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@SuppressWarnings("ALL")
public class ContextAwareQueueMessagingTemplate {
    public static final String LOG_ATTRIBUTES_HEADER = "logAttributes";
    private final QueueMessagingTemplate queueMessagingTemplate;
    private final boolean enabled;

    public ContextAwareQueueMessagingTemplate(final AmazonSQSAsync amazonSqs, final Environment environment) {
        this.queueMessagingTemplate = new QueueMessagingTemplate(amazonSqs);
        this.enabled = EnvironmentDirector.isEnabled(environment);
    }

    public void send(String destinationName, Message<?> message) throws MessagingException {
        Message<?> finalMessage = message;
        if (this.enabled) {
            finalMessage = addingTenantContextOnHeader(message);
        }

        this.queueMessagingTemplate.send(destinationName, finalMessage);
    }

    public <T> void convertAndSend(String destinationName, T payload, Map<String, Object> headers) throws MessagingException {
        if (this.enabled) {
            headers.put(LOG_ATTRIBUTES_HEADER, LogAttributeDirector.make());
        }

        this.queueMessagingTemplate.convertAndSend(destinationName, payload, headers);
    }

    private Message<?> addingTenantContextOnHeader(Message<?> message) {
        Map<String, Object> logAttributes = new HashMap<String, Object> ();
        logAttributes.put(LOG_ATTRIBUTES_HEADER, LogAttributeDirector.make());

        return MessageBuilder.withPayload(message.getPayload().toString())
                .copyHeaders(logAttributes)
                .build();
    }
}
