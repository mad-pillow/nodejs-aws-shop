#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { NodejsAwsShopStack } from "../lib/nodejs-aws-shop-stack";
import { ImportServiceStack } from "../lib/import-service-stack";

const app = new cdk.App();
new NodejsAwsShopStack(app, "NodejsAwsShopStack");
new ImportServiceStack(app, "ImportServiceStack");
