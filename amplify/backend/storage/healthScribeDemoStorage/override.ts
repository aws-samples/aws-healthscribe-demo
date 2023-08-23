import { AmplifyProjectInfo, AmplifyS3ResourceTemplate } from '@aws-amplify/cli-extensibility-helper';

export function override(resources: AmplifyS3ResourceTemplate, amplifyProjectInfo: AmplifyProjectInfo) {
    /**
     * Override the default public poilcy to allow Put, Get, and Delete from the entire bucket
     * This is due to HealthScribe writing its results to the first level of the S3 bucket
     * All authenticated users can store and retrieve files in this bucket
     **/
    resources.s3AuthPublicPolicy.policyDocument.Statement.push({
        Effect: 'Allow',
        Action: ['s3:PutObject', 's3:PutObjectAcl', 's3:GetObject'],
        Resource: `${resources.s3Bucket.attrArn}/*`,
    });

    // Block all public access to the bucket
    resources.s3Bucket.publicAccessBlockConfiguration = {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
    };

    // Bucket logging is configured via the Lambda function addBucketLogging and Custom Resource addBucketLogging

    /**
     * Create a service role for HealthScribe jobs
     * This allows HealthScribe to access the Amplify-created S3 bucket
     * The role ARN is set as a CloudFormation output, adn is used by a post-push
     *   Amplify hook to write to the frontend
     */
    resources.addCfnResource(
        {
            type: 'AWS::IAM::Role',
            properties: {
                AssumeRolePolicyDocument: {
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Effect: 'Allow',
                            Principal: {
                                Service: ['transcribe.amazonaws.com'],
                            },
                            Action: ['sts:AssumeRole'],
                        },
                    ],
                },
                Path: '/',
                Policies: [
                    {
                        PolicyName: 'healthscribe-demo-service-policy',
                        PolicyDocument: {
                            Version: '2012-10-17',
                            Statement: [
                                {
                                    Action: ['s3:GetObject', 's3:PutObject'],
                                    Resource: `${resources.s3Bucket.attrArn}/*`,
                                    Effect: 'Allow',
                                },
                                {
                                    Action: 's3:ListBucket',
                                    Resource: `${resources.s3Bucket.attrArn}`,
                                    Effect: 'Allow',
                                },
                            ],
                        },
                    },
                ],
            },
        },
        'HealthScribeServiceRole'
    );

    // Allow authenticated users to pass the role below to HealthScribe
    resources.addCfnResource(
        {
            type: 'AWS::IAM::Policy',
            properties: {
                PolicyName: 'healthscribe-service-passrole',
                PolicyDocument: {
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Resource: { 'Fn::GetAtt': ['HealthScribeServiceRole', 'Arn'] },
                            Action: ['iam:PassRole'],
                            Effect: 'Allow',
                        },
                    ],
                },
                Roles: [
                    {
                        Ref: 'authRoleName',
                    },
                ],
            },
        },
        'HealthScribeServicePassRolePolicy'
    );

    // Add service role ARN to the stack outputs. Used by Amplify post-push hook to write to the frontend
    resources.addCfnOutput(
        {
            value: { 'Fn::GetAtt': ['HealthScribeServiceRole', 'Arn'] } as unknown as string,
        },
        'HealthScribeServiceRoleArn'
    );
}
