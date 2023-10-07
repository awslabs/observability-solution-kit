package com.amazon.sdk.spring.logging.interceptor;

import com.amazon.sdk.spring.logging.service.ContextExtractor;
import com.amazon.sdk.spring.logging.service.TokenDirector;
import com.amazon.sdk.spring.logging.service.MdcDirector;
import com.amazon.sdk.spring.tracing.TraceDirector;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Map;
import java.util.Optional;

@SuppressWarnings("NullableProblems")
public class LoggingContextInterceptor implements HandlerInterceptor {
    private static final String TRACE_HEADER = "x-amzn-trace-id";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (request.getMethod().equals("OPTIONS")) {
            return true;
        }

        Optional<String> jwtFromRequest = TokenDirector.getJwtFromRequest(request);
        Map<String, String> extractContext = ContextExtractor.extract(request.getRequestURI(), request.getMethod(), request.getHeaderNames(), jwtFromRequest);

        extractContext.put("requestId", request.getHeader(TRACE_HEADER));
        extractContext.put("traceId", TraceDirector.loadTraceId());

        MdcDirector.init(extractContext);
        return HandlerInterceptor.super.preHandle(request, response, handler);
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        HandlerInterceptor.super.postHandle(request, response, handler, modelAndView);
        MdcDirector.cleanAll();
    }
}
