# ollyv: NodeLambda!

<br/>

## Metadata

### Module System

> This Module support both `CommonJS` and `ES Moulde`.

<br/>

🛞 CommonJS

```javascript
const { Logger, middlewares, interceptor } = require('@ollyv/lambda');
```

🚀 ES Module

```javascript
import { Logger, middlewares, interceptor } from '@ollyv/lambda';
```

<br/>

### Dependencies

List of dependencies required for the SDK.

```json
{
  "dependencies": {
    "@aws-lambda-powertools/logger": "^1.9.0",
    "@middy/core": "^4.5.2",
    "callee": "^1.1.1",
    "cookie": "^0.5.0",
    "jsonwebtoken": "^9.0.1",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "@babel/cli": "^7.22.5",
    "@babel/core": "^7.22.5",
    "@babel/preset-env": "^7.22.5",
    "aws-sdk": "^2.1382.0",
    "babel-jest": "^29.5.0",
    "clean-jsdoc-theme": "^4.2.9",
    "express": "^4.18.1",
    "jest": "^29.5.0",
    "jsdoc": "^4.0.2",
    "node-fetch": "^2.6.7",
    "supertest": "^6.3.3"
  }
}
```

<br/>
<br/>

## Overview

The Observability SDK provides context-aware logging, offering exceptional tools for tracking application behavior and quickly identifying issues.

Using the `ollyv` SDK, context-aware structured log is created in a distributed microservice Lambda environment. It also allows you to maintain a tenant context between other services that interact with Lambda. And Logger can be configured using the configuration which should be defined by yourself.

Using this module in the Lambda function will operate internally as shown below.

![](images/ollyv-lambda-diagram.png)

<br/>
<br/>

## Package Structure

```

ollyv/lambda
  │
  ├──  ...
  ├──  configs/ : configurations for build and packaging
  │      ├─  package.cjs.json
  │      └─  package.esm.json
  ├──  docs/ : documents (README.md, images, etc.)
  │      ├─  images
  │      └─  ...
  ├──  examples/ : example codes
  │      ├─  example code
  │      └─  ...
  ├──  dist/ : transpiled output of the package
  │      ├─  cjs/ : support the use of package in commonjs type
  │      │     ├─  compiled output for commonjs
  │      │     ├─  compiled output for commonjs
  │      │     └─  ...
  │      ├─  esm/ : support the use of package in es module type
  │      │     ├─  compiled output for esmodule
  │      │     ├─  compiled output for esmodule
  │      │     └─  ...
  │      └─  layers/ : archive of lambda extension .zip
  │            └─  extension.zip
  ├──  src/
  │      ├─  const/ : constants
  │      │     └─  contextTypeConst.js : constants needed for logger
  │      ├─  middleware/ : middlewares
  │      │     └─  interceptor.js :  extract & set tenant context to the logger ...
  │      ├─  service/ : Service Module
  │      │     ├─  contextExtractor.js : extract tenant context from token
  │      │     ├─  logFormatter.js : transform log format to structured JSON format based on log options from the configuration
  │      │     ├─  logger.js : logger module (powertools logger wrapper)
  │      │     ├─  tokenDirector.js : token(jwt) mangaer
  │      │     ├─  middlewares.js : where to declare all middleware to use
  │      │     └─  ...
  │      └─   index.js : where to declare all modules to be used as a package
  ├──  .babelrc : babel config for transpiling the package
  ├──  .npmignore : define excluded files for packaging
  ├──  jest.config.js : jest config file
  ├──  package.json
  ├──  README.md
  └──  ...



```

<br/>
<br/>

## Configuration

To use the ollyv logger, config should be defined.
To enable multiple lambda functions to use the global configuration, the following methods are recommended.

1. Define config object in Layer. (or specific directory)
2. Defined as string in SSM Parameter Store
3. Defining as Json Config in AppConfig

<br/>

Please see the below description of the configuration.

```json
{
  // whether enable or disable logger
  "enableLogging": true,
  "logOptions": {
    // whether to append the trace id to the logger
    "ENABLE_XRAY_TRACE_ID": true,
    // whether to append the function name to the logger
    "ENABLE_CALLER": true,
    // when 'ENABLE_CALLER' is 'true', prefix of the caller
    "CALLER_PREFIX": "lambda:"
  },
  "logConst": {
    // string to be set when tenant context can't be identified
    "UNKNOWN": "unknown",
    // key value when adding the extracted context to the lambda event payload
    "SET_CONTEXT_INTO_LAMBDA_PAYLOAD_KEY": "_logContext",
    // key value of the JWT
    "LOG_CONTEXT_FROM_TOKEN_KEY": "headers.Authorization",
    // key value of the tenanat context, if it is invoked from another lambda function
    "LOG_CONTEXT_FROM_LAMBDA_KEY": "_logContext",
    // key value of the tenanat context, if it is triggered from SQS
    "LOG_CONTEXT_FROM_SQS_KEY": "messageAttributes.logAttributes.stringValue",
    // key value of the tenanat context, if it is invoked from ECS
    "LOG_CONTEXT_FROM_ECS_KEY": "_logContext"
  },
  // log format when tenant context extracted form JWT and it is appended to logger
  "headerLogFormat": {
    // configure the log format using dot notation expression
    // e.g) "<key of tenant context in JWT>": "<key to be set into logger>"
  "tenant.tenantId"   : "tenantContext.tenantId",
  "tenant.tenantName" : "tenantContext.tenantName",
  "tenant.plan"       : "tenantContext.plan",
  "account.userId"    : "userContext.userId",
  "account.gender"    : "userContext.gender",
  "account.role"      : "userContext.role",
  }
}
```

<br/>
<br/>

## Deployment

When deploying lambda fuctions and layers, the Lambda environment variables and configuration that should be set for SDK use are as follows.

[Layers]

- 🐿️ `@ollyv` should be included as a dependency and deployed to layer

[Environment Variable]

- 🐿️ No environmental variables required

[Runtime]

- 🐿️ Node 16.x~ (Node 18 is recommended)

<br/>
<br/>

### Development

To apply the logging module to a lambda function, follow this steps:

1️⃣ Import the Logger, middleware, and interceptor from the ollyv/sdk-lambda-logging module. It is included as a dependency in the lambda layer. Also, import the LOG_CONFIG which should be defined by yourself.

```javascript
const LOG_CONFIG = <path/to/config>;
const { Logger, middlewares, interceptor } = require('@ollyv/lambda');
```

2️⃣ Create a Logger with the log configuration, which is in the `<path/to/config>`

> The LOG_CONFIG might be defined in the `<path/to/config>`. This means that the configuration of the logger is a parameter in the parameter store. If LOG_CONFIG is not specified or if `“enableLogging"=false` in `LOG_CONFIG`, `logger.info()` internally outputs the log using `console.log()`.

```javascript
const LOG_CONFIG = <path/to/config>;
const { Logger, middlewares, interceptor } = require('@ollyv/lambda');

const logger = new Logger(LOG_CONFIG);
```

> (Optional) Logger can be created with logLevel, serviceName options. If logLevel options is set to one of `INFO`, `WARN`, `ERROR`, `DEBUG`, logger will be set it’s log level. And, if serviceName is set to some string value, it will always be presented in the service_name of the log.

```javascript
const LOG_CONFIG = <path/to/config>;
const logger = new Logger(LOG_CONFIG, { serviceName: 'my-servie', logLevel: 'INFO' });
```

3️⃣ Modify the Lambda's handler function to a constant variable.

```javascript
const lambdeHandler = async (event, context) => { ... }
```

4️⃣ Register the ollyv interceptor as middleware with the logger at the bottom of the Lambda function.

> This way, before entering the lambda handler function, the ollyv module's interceptor will execute. It intercepts the incoming request, extracts the tenant context in an appropriate manner for each event source, and structures the log accordingly.

```javascript
const lambdeHandler = async (event, context) => {
...
}
exports.handler = middlewares(lambdaHandler).use(interceptor(logger));
```

5️⃣ Change all existing console.log() statements in the Lambda function to appropriate log levels like logger.info(), logger.error(), etc. By doing this, the context-aware structured log will be applied within the Lambda function.

```javascript
const lambdaHandler = async (event, context) => {
// replace console.log() to logger.info()
logger.info('Hello from lambda');
logger.debug('Hello from lambda');
logger.error('Hello from lambda');
logger.warn('Hello from lambda');
...
};
```

6️⃣ (Conditional) If the Lambda function uses other javascript classes to call other AWS services, you need to propagate the tenant context to the target services.

7️⃣ (Conditional) Only for SQS trigger Lambda

> _This case is only applicable if the lambda function is sqs trigger lambda._

> If lambda receive only one message from SQS, tenant context is automatically extracted from single message at middleware called interceptor.
> But, if lambda function receive multiple SQS records at once, interceptor can’t specify the tenant context. Because, each record of SQS message has a different context. In this case, log context is set 'unknown_batch'. So, you should append the context into logger function where process each SQS message using logger.appendContextFromSQSMessage() of Logger module.

```javascript
// Example

exports.handler = async (event) => {
  const messages = async (deviceEventMessage) => {
    // process each message
    for (const message of deviceEventMessage.Records) {
      // Log context should be set from single message
      logger.appendContextFromSQSMessage(message);
      const body = JSON.parse(message.body);
      const { screenId } = body;
      console.log(`[${screenId}] message : ${JSON.stringify(body)}`);
      try {
        await enrollment(screenId);
      } catch (e) {
        console.log(`[${screenId}][ERROR] ${e.message}`);
      }
    }
  };
  await messages(event);
};
```

<br/>
<br/>

As a result, the lambda function is changed as follows.

**[AS-IS]**

```javascript
exports.handler = async (event, context) => {
  console.log('Hello from Lambda');
  console.log('Hello from Lambda');
  console.log('Hello from Lambda');
  console.log('Hello from Lambda');

  return {
    statusCode: 200,
    body: JSON.stringify({
      response: 'success',
    }),
  };
};
```

**[TO-BE]**

```javascript
const LOG_CONFIG = <path/to/config>;
const { Logger, middlewares, interceptor } = require('@ollyv/lambda');
const logger = new Logger(LOG_CONFIG);
...

const lambdaHandler = async (event, context) => {
...
logger.info('Hello from Lambda');
logger.debug('Hello from Lambda');
logger.error('Hello from Lambda');
logger.warn('Hello from Lambda');

// If the Lambda function uses services,
// you need to propagate the tenant context to the target services.

};

exports.handler = middlewares(lambdaHandler).use(interceptor(logger));

```

The log is output as follows.

1. logger.info()

   ```json
   {
     "level": "INFO",
     "message": "Hello from Lambda",
     "service": "<lambda-function-name>",
     "timestamp": "2023-06-26T13:03:34.639Z",
     "xray_trace_id": "1-64998ca6-47085075585a5c65164ff3d3",
     "tenantContext": {
       "tenantId": "EA003DC7-C155-431D-876E-EDF37CBBCCB0",
       "tenantName": "proserve",
       "plan": "Trial"
     },
     "userContext": {
       "userId": "C75D6EE0-8FE9-4918-8EEA-1DC382521771",
       "gender": "female",
       "role": "CUSTOMER"
     },
     "caller": "lambda:/var/task/index.js:56:16",
     "traceId": "undefined"
   }
   ```

2. console.log()

   ```
   2023-08-31T05:14:32.677Z	3eb7caf0-5381-4202-8b72-11b00ed4159d	INFO	Hello from Lambda
   ```

   <br/>
   <br/>

#### Logger for JavaScript calss


If you want to `ollyv` Logger for JavaScript class, please follow these steps.

1. Import the Logger from the `@ollyv/lambda` module and `LOG_CONFIG` which should be defined by yourseld, and declare the logger as let variable.

   ```javascript
   const LOG_CONFIG = <path/to/config>;
   const { Logger } = require('@ollyv/lambda');
   let logger;
   ```

2. At the beginning of the constructor function, create logger with the LOG_CONFIG in `'<path/to/config>`.

   ```javascript
    class MyClass {
      constructor() {
      if(!logger) {
      logger = new Logger(LOG_CONFIG);
      }
      }
      ...
      }
   ```

   > (Optional) Logger can be created with logLevel, serviceName options. If logLevel options is set to one of `INFO`, `WARN`, `ERROR`, `DEBUG`, logger will be set it’s log level. And, if serviceName is set to some string value, it will always be presented in the `service` of the log.

   ```javascript
   const LOG_CONFIG = <path/to/config>;

   class MyClass {
   constructor() {
     if(!logger) {
       logger=new Logger(LOG_CONFIG, {serviceName: 'my-servie', logLevel: 'INFO'});
       }
     }
   ...
   }
   ```

3. Replace all existing `console.log()` statements in the Lambda function to appropriate log levels like `logger.info()`, logger.error(), etc.

   > In this way, a log in the format of a structured JSON is generated. The logger may know `caller` and `traceId`, but the tenant context is output as `unknown`. This is because if you don't inject tenant context directly, logger can't know it.

<br/>
<br/>

### Debugging

- 🔎 When the log context set to `unknown`?
  - 💡 Token(JWT) has no tenant context
  - 💡 Invalid configuration of the Logger
- 🔎 When the log context set to `unknown_batch`?
  - 💡 Multiple SQS message records

<br/>
<br/>

### References

- 📙 [AWS Obeservability Best Practices](https://aws-observability.github.io/observability-best-practices/signals/logs/#structured-logging-is-key-to-success)
- 📙 [Serverless Applications Lens](https://docs.aws.amazon.com/wellarchitected/latest/serverless-applications-lens/welcome.html) - AWS Well-Architected Framework
- 📙 [SaaS Lens](https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/saas-lens.html) - AWS Well-Architected Framework
