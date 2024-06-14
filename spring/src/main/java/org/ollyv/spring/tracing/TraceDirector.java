package org.ollyv.spring.tracing;

import com.amazonaws.xray.AWSXRay;
import com.amazonaws.xray.entities.Segment;
import java.util.Optional;

public class TraceDirector {
    public static String loadTraceId() {
        Optional<Segment> segmentOptional = AWSXRay.getCurrentSegmentOptional();

        if (segmentOptional.isPresent()) {
            Segment segment = segmentOptional.get();
            return segment.getTraceId().toString();
        }
        return "UNKNOWN";
    }
}
