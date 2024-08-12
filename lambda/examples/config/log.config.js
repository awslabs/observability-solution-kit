const LOG_CONFIG = {
    // whether enable or disable logger
    "enableLogging": true,
    "logOptions": {
      // whether to append the function name to the logger
      "ENABLE_CALLER": true,
      // when 'ENABLE_CALLER' is 'true', prefix of the caller
      "CALLER_PREFIX": "lambda:"
    },
    "logConst": {
      // string to be set when context can't be identified
      "UNKNOWN": "unknown",
      // key value when adding the extracted context to the lambda event payload
      "SET_CONTEXT_INTO_LAMBDA_PAYLOAD_KEY": "logContext",
      // key value of the JWT in headers
      "LOG_CONTEXT_FROM_TOKEN_KEY": "headers.Authorization",
      // key value of the tenanat context, if it is invoked from another lambda function
      "LOG_CONTEXT_FROM_LAMBDA_KEY": "logContext",
      // key value of the tenanat context, if it is invoked from ECS
      "LOG_CONTEXT_FROM_ECS_KEY": "logContext",
      // key value of the tenanat context, if it is triggered from SQS
      "LOG_CONTEXT_FROM_SQS_KEY": "messageAttributes.logAttributes.stringValue"
    },
    // log format when context extracted form JWT and it is appended to logger
    "headerLogFormat": {
      // configure the log format using dot notation expression
      // e.g) "<key of context in JWT>": "<key to be set into logger>"
      "tenant.id": "tenantContext.tenantId",
      "tenant.name": "tenantContext.tenantName",
      "tenant.tier": "tenantContext.tier",
      "user.userId": "userContext.userId",
      "user.gender": "userContext.gender",
      "user.role": "userContext.userRole",
      "user.country": "userContext.country",
    }
  }

  const example = {
    tenant: {
        tenantId: "xxxx-xxxxxxxx-xxxx",
        tenantName: "name",
        tier: "VIP"
    },
    user: {
        userId: "",
        gender: "F",
        role: "seller",
        country: "Canada"
    }
  }
    