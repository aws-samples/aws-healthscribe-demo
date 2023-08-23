const reply = require('./cfn-reply');

const { S3Client, PutBucketLoggingCommand } = require('@aws-sdk/client-s3');
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
        await reply.send(event, context, reply.FAILED, {});
    }
};
