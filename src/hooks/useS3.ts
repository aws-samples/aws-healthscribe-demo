// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import uuid4 from 'uuid4';

import amplifyOutputs from '@/../amplify_outputs.json';

export function useS3() {
    const uploadKeyPrefix = 'uploads/';

    const bucketName = amplifyOutputs.storage.bucket_name;
    function getUploadMetadata() {
        return {
            bucket: bucketName,
            key: uploadKeyPrefix + uuid4(),
        };
    }

    return [bucketName, getUploadMetadata] as const;
}
