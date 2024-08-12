package com.amazon.sdk.spring.logging.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Slf4j
@SuppressWarnings("OptionalUsedAsFieldOrParameterType")
public class ContextExtractor {
    private static final int PAYLOAD_INDEX_1 = 1;
    private final static ObjectMapper mapper = new ObjectMapper();
    private static final DynamicTenantContextFieldMaker dynamicTenantContextFieldMaker = DynamicTenantContextFieldMaker.instance;

    public static Map<String, String> extract(final String url, final String method, final Enumeration<String> headerNames, final Optional<String> jwtFromRequest) {
        Map<String, String> results = new HashMap<>();

        if (jwtFromRequest.isEmpty()) {
            return results;
        }

        try {
            String jwt = jwtFromRequest.get();
            String[] contents = jwt.split("\\.");
            if (contents.length != 3) {
                List<String> headers = HeaderExtractor.extract(headerNames);
                log.warn("[AuthCheck] jwt is invalid. url: {}, method: {}, headerNames: {}, jwt : {}", url, method, headers, jwt);
                return results;
            }
            byte[] bytes = Base64.getUrlDecoder().decode(contents[PAYLOAD_INDEX_1]);
            String decodedPayload = new String(bytes, StandardCharsets.UTF_8);

            Map map = mapper.readValue(decodedPayload, Map.class);
            Map<String, String> srcAndDest = dynamicTenantContextFieldMaker.sourceAndDestination();
            for (String key: srcAndDest.keySet()) {
                final String destinationKey = srcAndDest.get(key);
                Map workingMap = map;
                String[] splits = key.split("\\.");
                int depth = 0;
                for (String src : splits) {
                    if (workingMap == null) {
                        results.put(destinationKey, null);
                        break;
                    }

                    if(splits.length == ++depth) {
                        Object finalResult = workingMap.get(src);
                        results.put(destinationKey, finalResult == null ? null : finalResult.toString());
                        break;
                    }

                    if (src.contains("[")) {
                        String[] split = src.split("\\[");
                        String srcGroup = split[0];
                        String srcGroupIndex = split[1].replaceAll("]","");
                        workingMap = (Map) (((List<Map>)workingMap.get(srcGroup)).get(Integer.parseInt(srcGroupIndex)));
                        continue;
                    }

                    workingMap = (Map) workingMap.get(src);
                }
            }
        } catch(Exception e) {
            List<String> headers = HeaderExtractor.extract(headerNames);
            log.warn("[AuthCheck] Extract context invalid : url: {}, method: {}, headerNames: {}, jwt : {}, warnMsg: {}", url, method, headers, jwtFromRequest.get(), e.toString());
        }
        return results;
    }
}
