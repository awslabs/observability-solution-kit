# Ollyv: Express!

## Installation

To install the Ollyv SDK for Express logging, run the following command in your project's root directory:

```sh
npm i @ollyv/express
```

Open a file named `app.js` or the main file to be executed.

- 🎤 Example for CommonJS

  ```javascript
  // 1. Import necessary modules
  // 1.1. [Logging] Use contextMiddleware for logging
  // 1.2. [Tracing] Use openSegment and closeSegment for tracing
  const { contextMiddleware, openSegment, closeSegment } = require('@ollyv/express');

  const app = express();

  // 2.1 [Tracing] If you wish to enable tracing, add the tracing middleware
  app.use(openSegment());
  // 2.2 [Logging] Register the contextMiddleware after body-parser, e.g., express-busboy, body-parser
  app.use(contextMiddleware);
  ...
  // 3. [Tracing] Don't forget to close the segment to ensure proper tracing
  app.use(closeSegment());
  ```

- 🎤 Example for ES Module

  ```javascript
  // 1. Import necessary modules
  // 1.1. [Logging] Use contextMiddleware for logging
  // 1.2. [Tracing] Use openSegment and closeSegment for tracing
  import { contextMiddleware, openSegment, closeSegment } from '@ollyv/express';

  export const startServer = () => {
    ...
    // 2.1 [Tracing] If you wish to enable tracing, add the tracing middleware
    app.use(openSegment());
    // 2.2 [Logging] Register the contextMiddleware after body-parser, e.g., express-busboy, body-parser
    app.use(contextMiddleware);
    ...

    // 3. [Tracing] Don't forget to close the segment to ensure proper tracing
    app.use(closeSegment());
    ...
  };

  ```

## Configuration

The Ollyv SDK offers a simple way to configure its behavior through `*.properties` files, which are environment-specific. Below are the available properties and their usage:

```
...

[saas]
observability.name = delivery-service
observability.tracing.origin = AWS::ECS::Fargate
observability.logging.enable = true
```

- `observability.name`
  - Description: Specifies the name of the observability component for tracing.
  - Example: observability.name = delivery-service
- `observability.tracing.origin`
  - Description: Specifies the origin of the tracing.
  - Example: observability.tracing.origin = AWS::ECS::Fargate
- `observability.logging.enable`
  - Description: Determines whether logging is enabled or disabled.
  - Example: observability.logging.enable = true

## Logging

### <strong>If you want to log with error, it's required to use logger.error(<span style="color:red">e.stack</span>)</strong>

- 🎤 Example for CommonJS

  ```javascript
  const { contextMiddleware, openSegment, closeSegment } = require('@ollyv/express');
  ...
  const bb = require('express-busboy');
  const app = express();
  bb.extend(app, {
    upload: true,
    path : './temp/'
  });
  app.use(openSegment());

  // if express uses "body parser" like express-busboy,  contextMiddleware should be placed after the body parser.
  app.use(contextMiddleware);
  app.use(timeout('1820s'));
  ...

  ```

- 🎤 Example for ES Module

  ```javascript
  import { logger, ContextAwareSqsConsumer } from '@ollyv/express';

  export const sqsListener = () => {
    ...
    const sqsConsumer = ContextAwareSqsConsumer.create({
      messageAttributeNames: ['All'],
      queueUrl: queueUrl,
      handleMessage: async (m) => {
        try {
          const { Body } = m;
          logger.info(`message : `, JSON.stringify(m));
          const body = JSON.parse(Body);
          await sendMessage(body);
        } catch (e) {
          logger.info(`error: `, e.stack);
        }
      }
    });
  //...
  ```

## Tracing

- 🎤 Example for CommonJS

  ```javascript
  const {
    contextMiddleware,
    openSegment,
    closeSegment,
  } = require('@ollyv/express');
  //...
  const app = express();
  app.use(openSegment());
  app.use(contextMiddleware);
  //...
  app.use(closeSegment());
  ```

  ```javascript
  const { logger, tracer } = require('@ollyv/express');
  const AWS = tracer.captureAWS(require('aws-sdk'));
  ```

- 🎤 Example for ES Module
  ```javascript
  import { logger, contextMiddleware, openSegment, closeSegment } from '@ollyv/express';
  const app = express();
  export const startServer = () => {
    app.use(openSegment());
    app.use(contextMiddleware);
    app.use(closeSegment());
  ```
  ```javascript
  import { logger, tracer } from '@ollyv/express';
  import plainPg from 'pg';
  const pg = tracer.capturePostgres(plainPg);
  ```

### Generating custom subsegments

- Each time you make a call with an instrumented client, the tracer from SDK records the information generated in a subsegment. You can create additional subsegments to group other sebsegments, to measure the performance of a section of code, or to record annotations and metadata.

  - Example app.js - custom subsegments Express

    ```javascript
    const { tracer, openSegment, closeSegment } = require('@ollyv/express');
    app.use(openSegment('MyApp'));

    app.get('/', function (req, res) {
      var host = 'api.example.com';

      tracer.captureAsyncFunc('send', function (subsegment) {
        sendRequest(host, function () {
          console.log('rendering!');
          res.render('index');
          subsegment.close();
        });
      });
    });

    app.use(closeSegment());

    function sendRequest(host, cb) {
      var options = {
        host: host,
        path: '/',
      };

      var callback = function (response) {
        var str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        response.on('end', function () {
          cb();
        });
      };
      http.request(options, callback).end();
    }
    ```

## Dependencies

List of dependencies required for the SDK.

```json
{
  "devDependencies": {
    "@babel/cli": "^7.22.5",
    "@babel/core": "^7.22.5",
    "@babel/plugin-transform-modules-commonjs": "^7.22.5",
    "@babel/preset-env": "^7.22.5",
    "@types/sqs-consumer": "^5.0.0",
    "babel-jest": "^29.5.0",
    "clean-jsdoc-theme": "^4.2.9",
    "esm": "^3.2.25",
    "jest": "^29.5.0",
    "jsdoc": "^4.0.2",
    "mocha": "^10.2.0",
    "nodemon": "^2.0.22"
  },
  "dependencies": {
    "async_hooks": "^1.0.0",
    "aws-sdk": "^2.1398.0",
    "aws-xray-sdk": "^3.5.0",
    "callee": "^1.1.1",
    "jsonwebtoken": "^9.0.0",
    "lodash": "^4.17.21",
    "properties-reader": "^2.2.0",
    "sqs-consumer": "^5.8.0",
    "winston": "^3.9.0"
  }
}
```

## Package Structure

```
ollyv/express/
  ├── configs : configurations for build and packaging
  ├── dist : transpiled output of the package
  │   ├── cjs : support the use of package in commonjs type
  │   │   ├── compiled output for commonjs
  │   │   ├── compiled output for commonjs
  │   │   └── ...
  │   └── esm : support the use of package in es module type
  │       ├── compiled output for esmodule
  │       ├── compiled output for esmodule
  │       └── ...
  ├── src
  │   ├── configuration
  │   ├── const
  │   ├── layout
  │   ├── message
  │   ├── middleware
  │   └── service
  └── test : test code
  │   ├── configuration
  │   ├── message
  │   ├── middleware
  │   └── service
  ├── jest.config.js
  ├── jsdoc.config.json
  ├── package-lock.json
  └── package.json
```

## Test

- run test
  ```
  npm test
  ```
- test coverage
  ```
  npx jest --coverage
  ```

## Debugging

- 🔎 When the log context set to `unknown`?
  - 💡 Need to verify that the field exists in the token you actually receive from the client
  - 💡 Neet to make sure that you set logFormattingMap correctly in [express/src/layout/logLayout.js](./src/layout/logLayout.js)

## Documentation

```
npm run jsdoc
```

- configuration : `jsdoc.config.json`
  ```json
  {
    "plugins": ["plugins/markdown"],
    "opts": {
      "readme": "README.md",
      "destination": "./docs",
      "template": "node_modules/clean-jsdoc-theme",
      "theme_opts": {
        "default_theme": "dark",
        "search": false,
        "title": "<a href=\"index.html\" class=\"sidebar-title\" >Ollyv: NodeExpress</a>",
        "homepageTitle": "Ollyv Docs: NodeExpress",
        "includeFilesListInHomepage": true
      }
    },
    "script": {
      "generate-docs": "jsdoc --configure jsdoc.json --verbose"
    },
    "recurseDepth": 10,
    "source": {
      "include": [
        "src",
        "src/service",
        "src/configuration",
        "src/const",
        "src/layout",
        "src/message",
        "src/middleware"
      ],
      "includePattern": "/.+\\.js(doc|x)?$",
      "excludePattern": "(^|\\/|\\\\)_"
    },
    "sourceType": "module",
    "tags": {
      "allowUnknownTags": true,
      "dictionaries": ["jsdoc", "closure"]
    },
    "templates": {
      "cleverLinks": false,
      "monospaceLinks": false
    }
  }
  ```

## Reference

- 📙 [AWS Obeservability Best Practices](https://aws-observability.github.io/observability-best-practices/signals/logs/#structured-logging-is-key-to-success)
- 📙 [Generating custom subsegments with the X-Ray SDK for Node.js](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-nodejs-subsegments.html)
- 📙 [Tracing SQL queries with the X-Ray SDK for Node.js](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-nodejs-sqlclients.html)
- 📙 [Tracing calls to downstream HTTP web services using the X-Ray SDK for Node.js](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-nodejs-httpclients.html)
