package org.ollyv.spring.logging.service;

import lombok.extern.slf4j.Slf4j;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Consumer;

@Slf4j
public class DynamicTenantContextFieldMaker {
    public static final DynamicTenantContextFieldMaker instance = new DynamicTenantContextFieldMaker();
    private static final int SOURCE_INDEX_0 = 0;
    private static final int DESTINATION_INDEX_1 = 1;
    private static final String CUSTOM_TENANT_CONTEXT_FILE = "logging-context.saas";
    private final Map<String,String> sourceAndDestination;

    public DynamicTenantContextFieldMaker() {
        this.sourceAndDestination = new HashMap<>();
        FileReader reader = new FileReader();
        reader.readAndApply(line -> {
            String trimmedLine = line.replaceAll("\\s", "");
            String[] splitSourceAndDest = trimmedLine.split("=");
            if (splitSourceAndDest.length != 2) { // escape invalid format
                return;
            }
            this.sourceAndDestination.put(splitSourceAndDest[SOURCE_INDEX_0], splitSourceAndDest[DESTINATION_INDEX_1]);
        });
    }

    public Map<String,String> sourceAndDestination() {
        return this.sourceAndDestination;
    }

    public Collection<String> destinationKeys() {
        return sourceAndDestination().values();
    }

    public static final class FileReader {
        public void readAndApply(Consumer<String> worker) {
            ClassLoader classLoader = getClass().getClassLoader();
            try (InputStream inputStream = classLoader.getResourceAsStream(CUSTOM_TENANT_CONTEXT_FILE);
                 InputStreamReader streamReader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
                 BufferedReader reader = new BufferedReader(streamReader)) {

                String line;
                while ((line = reader.readLine()) != null) {
                    worker.accept(line);
                }

            } catch (IOException e) {
                System.out.println("FileReader ERROR: "  + e);
            }
        }
    }
}
