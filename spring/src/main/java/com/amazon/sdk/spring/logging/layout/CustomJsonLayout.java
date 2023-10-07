package com.amazon.sdk.spring.logging.layout;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.contrib.json.classic.JsonLayout;
import com.amazon.sdk.spring.logging.service.MdcDirector;
import java.util.Map;

public class CustomJsonLayout extends JsonLayout {
    private static final String CALLER_ATTR_NAME = "caller";
    private static final String CALLER_ECS_PREFIX = "ecs:";

    @Override
    protected void addCustomDataToJsonMap(Map<String, Object> map, ILoggingEvent event) {
        super.addCustomDataToJsonMap(map, event);
        excludeNotUsedField();
        includeCaller(map, event);
        MdcDirector.updateCustomDataToMap(map);
        map.remove("mdc");
    }

    private void includeCaller(final Map<String, Object> map, final ILoggingEvent event) {
        final String callerName = event.getLoggerName();
        map.put(CALLER_ATTR_NAME, CALLER_ECS_PREFIX + MdcDirector.getOrUnknown(callerName));
    }

    private void excludeNotUsedField() {
        setIncludeThreadName(false);
        setIncludeLoggerName(false);
        setIncludeContextName(false);
    }
}
