#  Ollyv SDK

<p align="center">
    <img src="./docs/image/logo.png" width="200px">
</p>

<p align="center">
    Welcome to the Ollyv sdk! Ollyv sdk is designed to empower your applications with seamless <a href="https://aws-observability.github.io/observability-best-practices/signals/logs/">logging</a> and comprehensive distributed <a href="https://aws-observability.github.io/observability-best-practices/signals/traces/">tracing</a> capabilities.
</p>

<p align="center">
  Get Started with <a href="./sdk/lambda/README.md"> NodeLambda ✨</a>
  ·
  <a href="./sdk/express/README.md"> NodeExpress 👟</a>
  ·
  <a href="./sdk/spring/README.md"> JavaSpring 🦚</a>
</p>

### 🫒 Key feature
1. Context-aware Logging:
    * Enables logging for each context defined by builders (user/group/deviceId/country, etc.).
    * Automatic extraction of predefined contexts ensures effortless filtering and monitoring of specific activities.
    * Contexts are seamlessly integrated into logs, eliminating the need for additional configuration.
1. Distributed Tracing:
    * Provides detailed tracing of interactions between services.
    * Enables distributed tracing in complex environments, allowing correlation among multiple interconnected services.

### 🫒 Centralized Logging Architecture
The Observability SDK (Ollyv) features a robust Centralized Logging Architecture, ensuring seamless application across multiple accounts and regions while guaranteeing optimal performance.
1. Efficient Multi-Account Support:
    * Effortlessly adapts to diverse multi-account scenarios.
    * Consistent and comprehensive logging is achieved across different accounts without compromising performance.
1. Global Multi-Region Support:
    * Remains effective regardless of the geographic regions where services are deployed.
    * Centralized logs are easily accessible, facilitating monitoring and troubleshooting across various regions.
