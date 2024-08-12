# Ollyv: JavaSpring!

## Prerequisites
Ensure that you have the following installed locally:
- Java11

## Installation
No installation is required.

## Configuration
### Property
The Ollyv SDK offers a simple way to configure its behavior through `*.properties` files, which are environment-specific. Below are the available properties and their usage:
Declare the following in the application-{env}.properties file of the environment you wish to reflect.
```properties
# aws saas logging module
saas.observability.name = {service_name}
saas.observability.logging.enable = true
```
- saas.observability.name
  - Description: Specifies the name of the observability component for tracing. 
  - Example: saas.observability.name = display-service
- saas.observability.logging.enable
  - Description: Determines whether logging is enabled or disabled. 
  - Example: saas.observability.logging.enable = true

### Dynamic tenant context properties
Add the file "logging-context.saas" for the DynamicTenantContext logging format as shown below.
```text
tenant.tenantId   = tenantContext.tenantId,
tenant.tenantName = tenantContext.tenantName,
tenant.plan       = tenantContext.plan,
account.userId    = userContext.userId,
account.gender    = userContext.gender,
account.role      = userContext.role,
user.userId       = userContext.userId
traceId           = traceId
requestId         = requestId
```

### Dockerfile for collecting trace segments
Add the X-Ray related agent to the Dockerfile as shown below.
```dockerfile
...
ADD https://github.com/aws/aws-xray-java-agent/releases/latest/download/xray-agent.zip /usr/local/ollyv-server/xray-agent.zip
RUN unzip /usr/local/ollyv-server/xray-agent.zip -d /usr/local/ollyv-server
RUN ls /usr/local/ollyv-server
ENV JAVA_TOOL_OPTIONS "-javaagent:/usr/local/ollyv-server/disco/disco-java-agent.jar=pluginPath=/usr/local/ollyv-server/disco/disco-plugins"
ENV AWS_XRAY_TRACING_NAME "display-service"
ENV AWS_XRAY_CONTEXT_MISSING "IGNORE_ERROR"
...
```

## Logging
Integration of ContextAware structured log with the message platform for application.
### Messaging platform Configuration
```java
@Configuration
public class SQSConfiguration {
    @Bean
    public SimpleMessageListenerContainerFactory simpleMessageListenerContainerFactory(AmazonSQSAsync amazonSqs, ContextAwareThreadPoolTaskExecutor asyncTaskExecutor) {
        ...
        return factory;
    }

    @Bean
    public ContextAwareThreadPoolTaskExecutor asyncTaskExecutor(final Environment environment) {
        ...
        return new ContextAwareThreadPoolTaskExecutor(threadPoolTaskExecutor, environment);
    }

    @Primary
    @Bean
    public AmazonSQSAsync amazonSQSAsync() {
        ...
        AmazonSQSAsync amazonSQSAsync = AmazonSQSAsyncClientBuilder.standard()
                ...
                .withRequestHandlers(new TracingHandler(AWSXRay.getGlobalRecorder()))
                .build();
        return amazonSQSAsync;
    }

    @Bean
    public ContextAwareQueueMessagingTemplate queueMessagingTemplate(AmazonSQSAsync amazonSQSAsync, final Environment environment) {
        return new ContextAwareQueueMessagingTemplate(amazonSQSAsync, environment);
    }
}
```

### Messaging consumer
```java
@Component
public class BootstrapListener {
    @Autowired
    private ContextAwareThreadPoolTaskExecutor messageListenerExecutor;

    @SqsListener(value = "${queue.sqs.url}", deletionPolicy = SqsMessageDeletionPolicy.NEVER)
    public void receiveBootstrap(String message, Acknowledgment ack, @Headers Map<String, String> headers) throws JsonProcessingException {
        messageListenerExecutor.submit (headers, () -> {
            ...
            ack.acknowledge();
        });
    }
}
```

## Tracing
To trace an AWS service, add the target for tracing through settings in the builder when creating the AWS service.
```java
@Configuration
public class DynamoDBConfiguration {
  // One of AWS service for tracing 
  private AmazonDynamoDB amazonDynamoDB() {
    return AmazonDynamoDBClientBuilder
            ...
            // Register the TracingHandler with the AWS service's withRequestHandlers as shown below
            .withRequestHandlers(new TracingHandler(AWSXRay.getGlobalRecorder()))
            .build();
  }
}
```

### Generating custom subsegments
If you want to add a segment by adding a circle to the service map, you can create a segment as attached guide.

## Dependencies
To use the SDK, include the following dependencies in your build.gradle.
```groovy
implementation("com.amazon.ollyv:spring:0.0.2")
implementation("ch.qos.logback.contrib:logback-json-classic:0.1.5")
implementation("ch.qos.logback.contrib:logback-jackson:0.1.5")
implementation("com.amazonaws:aws-xray-recorder-sdk-core:2.14.0")
implementation("com.amazonaws:aws-xray-recorder-sdk-aws-sdk:2.14.0")
```

## Package Structure
```
ollyv/spring/
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com.amazon.sdk.spring
│   │   │                      ├── common
│   │   │                      │   ├── message
│   │   │                      │   └── service
│   │   │                      ├── logging
│   │   │                      │   ├── configuration
│   │   │                      │   ├── interceptor
│   │   │                      │   ├── layout
│   │   │                      │   ├── message
│   │   │                      │   └── service
│   │   │                      └── tracing
│   │   └── resources
│   │       ├── META-INF
│   │       │   ├── spring
│   │       │   │   └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
│   │       │   ├── additional-spring-configuration-metadata.json
│   │       │   └── spring.factories
│   │       ├── logback-custom.xml
│   │       └── logback-spring.xml
│   └── test
│       └── groovy
│           └── com.amazon.sdk.spring
│                              ├── common
│                              │   ├── message
│                              │   └── service
│                              ├── logging
│                              │   ├── configuration
│                              │   ├── interceptor
│                              │   ├── layout
│                              │   ├── message
│                              │   └── service
│                              └── tracing
└── resources
    └── logging-context.saas
```

## Test
* run test
```
./gradlew :sdk:spring:test
```

## Documentation
```
cd {project_root_directory}
./gradlew :sdk:spring:javadoc
```

## Reference
* [Generating custom subsegments with the X-Ray SDK for java](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-java-subsegments.html)
