// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Progress, Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import tk from 'timekeeper';

import { getAmplifyRegion, getCredentials } from '@/utils/Sdk';

/**
 * Get an S3 client object. Use the Amplify region since that's where the uploaded files are stored
 */
async function getS3Client() {
    return new S3Client({
        region: getAmplifyRegion(),
        credentials: await getCredentials(),
    });
}

/**
 * @description Convert an S3 URL to a bucket and key object
 * @param {string} s3Uri An S3 URL, starting with s3:// or https://s3.
 * @returns { Bucket: string, Key: string }
 */
export function getS3Object(s3Uri: string): { Bucket: string; Key: string } {
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

/**
 * @description Get time with the last 14-minute interval.
 *              Sigv4 requests are valid up to 15 minutes of the timestamp
 */
function getDateLastDiscreteInterval() {
    const round = 1000 * 60 * 14;
    const date = new Date();
    return new Date(Math.floor(date.getTime() / round) * round);
}

/**
 * @description Get a presigned URL to an S3 object with a 1-day cache and 1-day expiration
 * @param getObjectProps
 */
type GetObjectProps = {
    Bucket: string;
    Key: string;
};
export async function getPresignedUrl(getObjectProps: GetObjectProps) {
    const s3Client = await getS3Client();
    const getObjectCmd = new GetObjectCommand({
        ...getObjectProps,
        ...{
            ResponseCacheControl: 'max-age: 900',
        },
    });

    return tk.withFreeze(getDateLastDiscreteInterval(), async () => {
        return await getSignedUrl(s3Client, getObjectCmd, { expiresIn: 900 });
    });
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
    ContentType?: string;
    callbackFn?: (progress: Progress) => void;
};
export async function multipartUpload({
    Bucket,
    Key,
    Body,
    ContentType = 'audio/mpeg',
    callbackFn,
}: MultipartUploadProps) {
    const params = { Bucket: Bucket, Key: Key, Body: Body, ContentType: ContentType };

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
    } catch (e: unknown) {
        const err = e as Error;
        throw new Error(`Error in S3 multipart upload: ${err.message}`);
    }
}
