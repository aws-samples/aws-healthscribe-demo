import * as AmplifyHelpers from '@aws-amplify/cli-extensibility-helper';
import * as cdk from 'aws-cdk-lib';
import { CfnOutput, CustomResource } from 'aws-cdk-lib';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

import { AmplifyDependentResourcesAttributes } from '../../types/amplify-dependent-resources-ref';

export class cdkStack extends cdk.Stack {
    constructor(
        scope: Construct,
        id: string,
        props?: cdk.StackProps,
        amplifyResourceProps?: AmplifyHelpers.AmplifyResourceProps
    ) {
        super(scope, id, props);
        /* Do not remove - Amplify CLI automatically injects the current deployment environment in this input parameter */
        new cdk.CfnParameter(this, 'env', {
            type: 'String',
            description: 'Current Amplify CLI env name',
        });

        // Get Amplify resources
        const amplifyResources: AmplifyDependentResourcesAttributes = AmplifyHelpers.addResourceDependency(
            this,
            amplifyResourceProps.category,
            amplifyResourceProps.resourceName,
            [
                { category: 'storage', resourceName: 'healthScribeDemoStorage' },
                { category: 'function', resourceName: 'addBucketLogging' },
            ]
        );
        const storageBucket = amplifyResources.storage.healthScribeDemoStorage.BucketName;
        const addBucketLoggingLambdaArn = amplifyResources.function.addBucketLogging.Arn;

        // Create a new logging bucket (SSL enforcement is applied in the custom resource)
        const loggingBucket = new Bucket(this, 'LoggingBucket', {
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            encryption: BucketEncryption.S3_MANAGED,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });

        // Invoke the Amplify-created Lambda function to add bucket policies and enable logging on the storage bucket
        new CustomResource(this, 'AddBucketLogging', {
            resourceType: 'Custom::AddBucketLogging',
            serviceToken: cdk.Fn.ref(addBucketLoggingLambdaArn),
            properties: {
                storageBucket: cdk.Fn.ref(storageBucket),
                loggingBucket: loggingBucket.bucketName,
            },
        });

        new CfnOutput(this, 'LoggingBucketName', { value: loggingBucket.bucketName });
    }
}
