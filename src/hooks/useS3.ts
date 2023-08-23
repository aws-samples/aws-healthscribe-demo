// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// UUID
import uuid4 from 'uuid4';

// Amplify-generated
import awsExports from '../aws-exports';

export function useS3() {
    const uploadKeyPrefix = 'uploads/HealthScribeDemo/';

    const bucketName = awsExports.aws_user_files_s3_bucket;
    const outputBucket = bucketName; // HealthScribe will append the job name to this prefix

    function getUploadMetadata() {
        return {
            bucket: bucketName,
            key: uploadKeyPrefix + uuid4(),
        };
    }

    return [outputBucket, getUploadMetadata] as const;
}
