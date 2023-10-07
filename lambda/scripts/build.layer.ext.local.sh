#!/bin/sh

# For local test
echo "======== build layer: [extension] start ========"
# export AWS_PROFILE=<aws_profile>

mkdir ./dist/layers

cd ./src/layers/extensions/telemetry-extension
npm install 
cd ../

chmod +x extensions/telemetry-extension 
zip -r extension.zip ./telemetry-extension 
zip -r extension.zip ./extensions

cp extension.zip ../../../dist/layers/extension.zip

echo "==== build layer: [extenxion] publishing...  ====="
aws lambda publish-layer-version \
    --layer-name "telemetry-extension" \
    --zip-file  "fileb://extension.zip"

echo "========  build layer: [extension] end  ========"
