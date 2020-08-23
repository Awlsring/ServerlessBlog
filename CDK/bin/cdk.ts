#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { apiGatewayStack } from '../lib/api-gateway-stack';
import { s3Stack } from '../lib/s3-stack';
import { dynamoStack } from '../lib/dynamo-stack';

const app = new cdk.App();

//Create API Gateway Stack
new apiGatewayStack(app, 'CdkStack');

//Create S3 Stack
new s3Stack(app, 'S3Stack');

//Create DynamoDB Stack
new dynamoStack(app, 'DynamoStack');