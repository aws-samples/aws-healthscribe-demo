const reply = require('./cfn-reply');

const { S3Client, PutBucketPolicyCommand, PutBucketLoggingCommand } = require('@aws-sdk/client-s3');
const s3Client = new S3Client();

const util = require('util');

/**
 * @description: Add bucket logging to the Amplify-created S3 bucket
 * @param {object} event CloudFormation event object, including S3 bucket names in ResourceProperties
 */
exports.handler = async (event, context) => {
    try {
        if (event.RequestType === 'Delete') {
            await reply.send(event, context, reply.SUCCESS, {});
            return;
        }

        console.log('Event', util.inspect(event, false, null, false));

        const storageBucket = event.ResourceProperties.storageBucket;
        const loggingBucket = event.ResourceProperties.loggingBucket;
        const accountIdFromCfRequest = event.StackId?.split(':')[4];

        // Define logging bucket policy
        const loggingBucketPolicy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Sid: 'AllowSSLRequestsOnly',
                    Action: 's3:*',
                    Effect: 'Deny',
                    Principal: '*',
                    Resource: [`arn:aws:s3:::${loggingBucket}`, `arn:aws:s3:::${loggingBucket}/*`],
                    Condition: {
                        Bool: {
                            'aws:SecureTransport': 'false',
                        },
                    },
                },
                {
                    Sid: 'S3ServerAccessLogsPolicy',
                    Action: 's3:PutObject',
                    Effect: 'Deny',
                    Principal: {
                        Service: 'logging.s3.amazonaws.com',
                    },
                    Resource: `arn:aws:s3:::${loggingBucket}/s3-access-logs*`,
                    Condition: {
                        ArnLike: {
                            'aws:SourceArn': `arn:aws:s3:::${storageBucket}`,
                        },
                        StringEquals: {
                            'aws:SourceAccount': accountIdFromCfRequest,
                        },
                    },
                },
            ],
        };

        // Add bucket logging policy to the logging bucket
        const putBucketPolicyInput = {
            Bucket: loggingBucket,
            Policy: JSON.stringify(loggingBucketPolicy),
        };
        const putBucketPolicyCmd = new PutBucketPolicyCommand(putBucketPolicyInput);
        await s3Client.send(putBucketPolicyCmd);

        // Add bucket logging to the Amplify-created S3 bucket
        const putBucketLoggingInput = {
            Bucket: storageBucket,
            BucketLoggingStatus: {
                LoggingEnabled: {
                    TargetBucket: loggingBucket,
                    TargetPrefix: 's3-access-logs/',
                },
            },
        };
        const putBucketLoggingCmd = new PutBucketLoggingCommand(putBucketLoggingInput);
        const putBucketLoggingRsp = await s3Client.send(putBucketLoggingCmd);

        await reply.send(event, context, reply.SUCCESS, putBucketLoggingRsp);
    } catch (e) {
        await reply.send(event, context, reply.FAILED, e);
    }
};
