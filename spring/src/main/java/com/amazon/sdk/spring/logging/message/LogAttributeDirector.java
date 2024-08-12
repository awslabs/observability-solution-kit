package com.amazon.sdk.spring.logging.message;

import com.amazon.sdk.spring.logging.service.DynamicTenantContextFieldMaker;
import com.amazon.sdk.spring.logging.service.MdcDirector;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import java.util.Collection;
import java.util.Optional;

@Slf4j
public class LogAttributeDirector {
    private static final DynamicTenantContextFieldMaker dynamicTenantContextFieldMaker = DynamicTenantContextFieldMaker.instance;
    private static final ObjectMapper mapper = new ObjectMapper();

    public static String make() {
        Collection<String> dstKeys = dynamicTenantContextFieldMaker.destinationKeys();
        return make(dstKeys);
    }

    private static String make(final Collection<String> dynamicDestinations) {
        try {
            ObjectNode rootNode = mapper.createObjectNode();

            for (String dynamicDestination : dynamicDestinations) {
                String[] keys = dynamicDestination.split("\\.");
                ObjectNode parentNode = rootNode;
                for (int index = 0; index < keys.length; index++) {
                    if (index == keys.length - 1) {
                        String targetField = keys[index];
                        parentNode.put(targetField, MdcDirector.getOrUnknownFromMdc(dynamicDestination));
                    } else {
                        ObjectNode childNode = (ObjectNode) Optional.ofNullable(parentNode.get(keys[index]))
                                .orElseGet(mapper::createObjectNode);
                        parentNode.set(keys[index], childNode);
                        parentNode = childNode;
                    }
                }
            }
            return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(rootNode);
        } catch (Exception e) {
            log.warn("[SaaS] Skipped parse to make : {}", e.toString());
            return "{}";
        }
    }

    public static JsonNode load(final Optional<String> logAttributeOptional) {
        if (logAttributeOptional.isEmpty()) {
            return mapper.createObjectNode();
        }
        try {
            String logAttribute = logAttributeOptional.get();
            return mapper.readTree(logAttribute);
        } catch (JsonProcessingException e) {
            log.warn("[SaaS] Skipped parse to load : {}", e.toString());
            return mapper.createObjectNode();
        }
    }
}
