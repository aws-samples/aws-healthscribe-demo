// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// S3 SDK
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Progress, Upload } from '@aws-sdk/lib-storage';

// Amplify-generated
import awsExports from '../../aws-exports';

// Amplify
import { Auth } from 'aws-amplify';

type GetObjectProps = {
    Bucket: string;
    Key: string;
};

async function getS3Client() {
    return new S3Client({
        region: awsExports?.aws_user_files_s3_bucket_region || 'us-east-1',
        credentials: await Auth.currentCredentials(),
    });
}

/**
 * @description Convert an S3 URL to a bucket and key object
 * @param {string} s3Uri An S3 URL, starting with s3:// or https://s3.
 * @returns { Bucket: string, Key: string}
 */
export function getS3Object(s3Uri: string) {
    if (s3Uri.startsWith('s3://')) {
        // s3://<bucket name>/<key>
        const inputUrl = new URL(s3Uri.replace(/^s3:\/\//, 'https://'));
        const bucket = inputUrl.host;
        const key = decodeURI(inputUrl.pathname.substring(1));
        return {
            Bucket: bucket,
            Key: key,
        };
    } else if (s3Uri.startsWith('https://s3')) {
        // https://s3.<region>.amazonaws.com/<bucket name>/<key>
        const inputUrl = new URL(s3Uri);
        const inputPath = inputUrl.pathname.split('/');
        return {
            Bucket: inputPath[1],
            Key: inputPath.splice(2).join('/'),
        };
    } else {
        throw new Error(`Unknown S3 URI ${s3Uri}.`);
    }
}

export async function getPresignedUrl(getObjectProps: GetObjectProps) {
    const s3Client = await getS3Client();
    const getObjectCmd = new GetObjectCommand(getObjectProps);
    // 300 seconds is the presigned URL's maximum age (5 minutes)
    return await getSignedUrl(s3Client, getObjectCmd, { expiresIn: 300 });
}

export async function getObject(getObjectProps: GetObjectProps) {
    const s3Client = await getS3Client();
    const getObjectCmd = new GetObjectCommand(getObjectProps);
    return await s3Client.send(getObjectCmd);
}

type MultipartUploadProps = {
    Bucket: string;
    Key: string;
    Body: File;
    // eslint-disable-next-line no-unused-vars
    callbackFn?: (progress: Progress) => void;
};
export async function multipartUpload({ Bucket, Key, Body, callbackFn }: MultipartUploadProps) {
    const params = { Bucket: Bucket, Key: Key, Body: Body };

    const s3Client = await getS3Client();
    try {
        const s3Upload = new Upload({
            client: s3Client,
            params: params,
            queueSize: 4, // (optional) concurrency
            partSize: 1024 * 1024 * 5, // (optional) size of each part, in bytes, at least 5MB
            leavePartsOnError: false, // (optional) manually handle dropped parts
        });

        s3Upload.on('httpUploadProgress', (progress) => {
            if (callbackFn) {
                callbackFn(progress);
            } else {
                console.debug('S3 upload progress: ', progress);
            }
        });
        return await s3Upload.done();
    } catch (e) {
        throw new Error(`Error in S3 multipart upload: ${(<Error>e).message}`);
    }
}
