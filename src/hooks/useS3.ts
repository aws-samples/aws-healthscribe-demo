// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import uuid4 from 'uuid4';

import awsExports from '@/aws-exports';

export function useS3() {
    const uploadKeyPrefix = 'uploads/HealthScribeDemo/';

    const bucketName = awsExports.aws_user_files_s3_bucket;
    function getUploadMetadata() {
        return {
            bucket: bucketName,
            key: uploadKeyPrefix + uuid4(),
        };
    }

    return [bucketName, getUploadMetadata] as const;
}
