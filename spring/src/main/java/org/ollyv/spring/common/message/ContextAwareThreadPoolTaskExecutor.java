package org.ollyv.spring.common.message;

import org.ollyv.spring.common.service.MetadataLoader;
import org.ollyv.spring.logging.message.LogAttributeDirector;
import org.ollyv.spring.logging.service.EnvironmentDirector;
import org.ollyv.spring.logging.service.MdcDirector;
import com.amazonaws.xray.AWSXRay;
import com.amazonaws.xray.entities.Segment;
import com.amazonaws.xray.entities.TraceHeader;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.env.Environment;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.core.task.TaskDecorator;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.Callable;
import java.util.concurrent.Future;

@Slf4j
@SuppressWarnings({"NullableProblems", "deprecation", "unused"})
public class ContextAwareThreadPoolTaskExecutor implements AsyncTaskExecutor {
    private static final String AWS_TRACE_HEADER = "AWSTraceHeader";
    private final ThreadPoolTaskExecutor threadPoolTaskExecutor;
    private final String serviceName;
    private final boolean enabled;

    public ContextAwareThreadPoolTaskExecutor(final ThreadPoolTaskExecutor executor, final Environment environment) {
        this.enabled = EnvironmentDirector.isEnabled(environment);
        this.threadPoolTaskExecutor = executor;
        if (this.enabled) {
            this.threadPoolTaskExecutor.setTaskDecorator(taskDecorator());
        }
        this.threadPoolTaskExecutor.initialize();
        this.serviceName = MetadataLoader.getServiceName(environment);
    }

    private TaskDecorator taskDecorator() {
        return runnable -> {
            Map<String, String> copyOfContextMap = MdcDirector.getCopyOfContextMap();
            Optional<Segment> seg = AWSXRay.getCurrentSegmentOptional();
            return () -> {
                try {
                    if (copyOfContextMap != null) {
                        MdcDirector.setContextMap(copyOfContextMap);
                        Segment segment = AWSXRay.beginSegment(this.serviceName);
                        final String awsTraceHeader = MDC.get(AWS_TRACE_HEADER);
                        TraceHeader traceHeader = TraceHeader.fromString(awsTraceHeader);
                        segment.setTraceId(traceHeader.getRootTraceId());
                        segment.setParentId(traceHeader.getParentId());
                        segment.setSampled(traceHeader.getSampled().equals(TraceHeader.SampleDecision.SAMPLED));
                    }

                    runnable.run();

                } catch (Exception e) {
                    log.error("Task has issue : {}", e.toString());
                } finally {
                    MdcDirector.cleanAll();
                    AWSXRay.endSegment();
                }
            };
        };
    }

    private Optional<String> extractLogAttributeFrom(final Map<String, String> messageAttributeHeaders) {
        if (messageAttributeHeaders == null || messageAttributeHeaders.isEmpty()) {
            return Optional.empty();
        }
        return Optional.ofNullable(messageAttributeHeaders.get(ContextAwareQueueMessagingTemplate.LOG_ATTRIBUTES_HEADER));
    }

    private void setUpBeforeRunning(final Map<String, String> headers) {
        String awsTraceHeader = headers.get(AWS_TRACE_HEADER);
        MDC.put(AWS_TRACE_HEADER, awsTraceHeader);

        if (this.enabled) {
            Optional<String> logAttributeOptional = extractLogAttributeFrom(headers);
            JsonNode node = LogAttributeDirector.load(logAttributeOptional);
            MdcDirector.loadFromMergedLogAttributes(node);
        }
    }

    public Future<?> submit(final Map<String,String> headers, final Runnable task) {
        setUpBeforeRunning(headers);
        return submit(task);
    }

    public void execute(final Map<String,String> headers, Runnable task) {
        setUpBeforeRunning(headers);
        execute(task);
    }

    @Override
    public void execute(Runnable task, long startTimeout) {
        this.threadPoolTaskExecutor.execute(task, startTimeout);
    }

    @Override
    public Future<?> submit(Runnable task) {
        return this.threadPoolTaskExecutor.submit(task);
    }

    @Override
    public <T> Future<T> submit(Callable<T> task) {
        return this.threadPoolTaskExecutor.submit(task);
    }

    @Override
    public void execute(Runnable task) {
        this.threadPoolTaskExecutor.execute(task);
    }
}
