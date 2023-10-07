package com.amazon.sdk.spring.logging.service;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;

import java.util.*;

@Slf4j
@SuppressWarnings("OptionalUsedAsFieldOrParameterType")
public class MdcDirector {
    private static final String UNKNOWN = "unknown";
    private static final DynamicTenantContextFieldMaker dynamicTenantContextFieldMaker = DynamicTenantContextFieldMaker.instance;

    public static void init(Map<String, String> extract) {
        for (String key : extract.keySet()) {
            MDC.put(key, extract.get(key));
        }
    }

    public static void updateCustomDataToMap(final Map<String, Object> map) {
        try {
            for (String key : dynamicTenantContextFieldMaker.destinationKeys()) {
                String[] splitByDepth = key.split("\\.");
                if (splitByDepth.length == 1) {
                    map.put(key, getOrUnknown(MDC.get(key)));
                    continue;
                }

                Properties parent = (Properties) map.get(splitByDepth[0]);
                if (parent == null) {
                    parent = new Properties();
                    map.put(splitByDepth[0], parent);
                }

                for (int depth=1; depth < splitByDepth.length-1; depth++) {
                    String child = splitByDepth[depth];
                    Properties childProperty = (Properties) parent.get(child);
                    if (childProperty == null) {
                        parent.put(child, new Properties());
                    }
                    parent = (Properties) parent.get(child);
                }

                parent.put(splitByDepth[splitByDepth.length-1], getOrUnknownFromMdc(key));
            }
        } catch (Exception e) {
            log.warn("updateCustomDataToMap error : {}", e.toString());
        }
    }

    public static String getOrUnknown(final String value) {
        String replaced = Objects.toString(value, UNKNOWN);
        return "".equals(replaced)? UNKNOWN : replaced;
    }

    public static String getOrUnknownFromMdc(final String key) {
        return getOrUnknown(MDC.get(key));
    }

    public static Map<String, String> getCopyOfContextMap() {
        return MDC.getCopyOfContextMap();
    }

    public static void setContextMap(final Map<String, String> copyOfContextMap) {
        MDC.setContextMap(copyOfContextMap);
    }

    public static void cleanAll() {
        MDC.clear();
    }

    public static void loadFromMergedLogAttributes(final JsonNode root) {
        List<String> keyFinals = new ArrayList<>();
        Map<String, String> resultMap = new HashMap<>();
        try {
            JsonParser jsonParser = root.traverse();
            String branch = "";
            String branchBefore = "";
            boolean startObject = false;
            while (!jsonParser.isClosed()) {
                JsonToken nextToken = jsonParser.nextToken();
                if (nextToken == JsonToken.START_OBJECT) {
                    startObject = true;
                } else if (nextToken == JsonToken.VALUE_STRING) {
                    keyFinals.add(branch);
                    String value = jsonParser.getValueAsString();
                    resultMap.put(branch, value);
                    branch = branchBefore;
                    startObject = true;
                } else if (nextToken == JsonToken.FIELD_NAME) {
                    if (startObject) {
                        String currentName = jsonParser.getCurrentName();
                        branchBefore = branch;
                        branch = branch.isBlank() ? currentName : branch + "." + currentName;
                        startObject = false;
                    }
                } else if (nextToken == JsonToken.END_OBJECT) {
                    branch = "";
                    startObject = true;
                }
            }
        } catch (Exception e) {
            log.warn("[LoadContext] skipped loadFromMergedLogAttributes");
        }
        init(resultMap);
    }
}
