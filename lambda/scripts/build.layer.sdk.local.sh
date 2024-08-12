#!/bin/sh

# For local test
echo "======== build layer: [Ollyv] start ========"
NODE_VERSION=node18
AWS_REGION=us-east-2
# export AWS_PROFILE=<aws_profile>

pwd
rm -rf ./layers/nodejs
mkdir -p ./layers/nodejs/

zip -r node_modules.zip node_modules
mv node_modules.zip ./layers/nodejs/node_modules.zip

cd ./layers/nodejs/
unzip node_modules.zip
rm -rf node_modules.zip

# cd ../../
cd ../
zip -r nodejs.zip ./nodejs

echo "==== build layer: [Ollyv] publishing...  ====="
aws lambda --region ${AWS_REGION} publish-layer-version \
    --layer-name "Ollyv" \
    --zip-file  "fileb://nodejs.zip"

echo "========  build layer: [Ollyv] end  ========"

rm -rf nodejs.zip