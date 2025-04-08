import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class HealthScribeDependencies extends Construct {
    readonly accessLogsBucket: s3.Bucket;
    readonly hsStorageBucket: s3.Bucket;
    readonly hsServiceRole: iam.Role;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Logging bucket
        const accessLogsBucket = new s3.Bucket(this, 'hs-access-logs', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            encryption: s3.BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
            removalPolicy: RemovalPolicy.RETAIN,
            versioned: true,
        });
        this.accessLogsBucket = accessLogsBucket;

        // Output bucket
        const hsStorageBucket = new s3.Bucket(this, 'hs-storage', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            cors: [
                {
                    allowedHeaders: ['*'],
                    allowedMethods: [
                        s3.HttpMethods.DELETE,
                        s3.HttpMethods.GET,
                        s3.HttpMethods.HEAD,
                        s3.HttpMethods.PUT,
                        s3.HttpMethods.POST,
                    ],
                    allowedOrigins: ['*'],
                    exposedHeaders: ['x-amz-server-side-encryption', 'x-amz-request-id', 'x-amz-id-2', 'ETag'],
                    maxAge: 3000,
                },
            ],
            encryption: s3.BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            lifecycleRules: [
                {
                    enabled: true,
                    expiration: Duration.days(90),
                },
            ],
            removalPolicy: RemovalPolicy.RETAIN,
            serverAccessLogsBucket: accessLogsBucket,
            serverAccessLogsPrefix: 'hs-storage-s3-access/',
        });
        this.hsStorageBucket = hsStorageBucket;

        /**
         * Create HealthScribe service role for Transcribe service to assume
         * The proxy calls iam:PassRole to this role
         */
        const hsServiceRole = new iam.Role(this, 'hs-role', {
            assumedBy: new iam.CompositePrincipal(
                new iam.ServicePrincipal('transcribe.amazonaws.com'),
                new iam.ServicePrincipal('transcribe.streaming.amazonaws.com')
            ),
            inlinePolicies: {
                HealthScribe: new iam.PolicyDocument({
                    statements: [
                        new iam.PolicyStatement({
                            actions: ['s3:ListBucket'],
                            resources: [hsStorageBucket.bucketArn],
                        }),
                        new iam.PolicyStatement({
                            actions: ['s3:GetObject', 's3:PutObject'],
                            resources: [`${hsStorageBucket.bucketArn}/*`],
                        }),
                    ],
                }),
            },
        });
        this.hsServiceRole = hsServiceRole;
    }
}
