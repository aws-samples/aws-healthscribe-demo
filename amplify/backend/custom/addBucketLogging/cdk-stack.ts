import * as cdk from 'aws-cdk-lib';
import * as AmplifyHelpers from '@aws-amplify/cli-extensibility-helper';
import { AmplifyDependentResourcesAttributes } from '../../types/amplify-dependent-resources-ref';
import { Construct } from 'constructs';
import { CustomResource, CfnOutput } from 'aws-cdk-lib';
import { Bucket, BlockPublicAccess, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

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

        // Create a new logging bucket
        const loggingBucket = new Bucket(this, 'LoggingBucket', {
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            encryption: BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });

        // Add a bucket policy to the logging bucket to allow S3 access logs
        loggingBucket.addToResourcePolicy(
            new PolicyStatement({
                sid: 'S3ServerAccessLogsPolicy',
                actions: ['s3:PutObject'],
                principals: [new ServicePrincipal('logging.s3.amazonaws.com')],
                resources: [`${loggingBucket.bucketArn}/s3-access-logs*`],
                conditions: {
                    ArnLike: {
                        'aws:SourceArn': `arn:aws:s3:::${cdk.Fn.ref(storageBucket)}`,
                    },
                    StringEquals: {
                        'aws:SourceAccount': this.account,
                    },
                },
            })
        );

        // Invoke the Amplify-created Lambda function to enable logging on the storage bucket
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
