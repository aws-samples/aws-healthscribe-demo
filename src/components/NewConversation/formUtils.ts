// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { StartMedicalScribeJobRequest } from '@aws-sdk/client-transcribe';

export function verifyJobParams(jobParams: StartMedicalScribeJobRequest) {
    // Check job name
    if (!/^[a-zA-Z0-9._-]{1,200}$/.test(jobParams.MedicalScribeJobName!)) {
        return {
            verified: false,
            message:
                'Job name must be between 1-200 characters. Valid characters are a-z, A-Z, 0-9, . (period), _ (underscore), and – (hyphen).',
        };
    }

    // Check access role ARN
    if (!jobParams.DataAccessRoleArn) {
        return {
            verified: false,
            message: 'Error parsing data access role ARN',
        };
    }

    // Check audio settings
    if (jobParams?.Settings?.ChannelIdentification == false) {
        const maxSpeakers = jobParams?.Settings?.MaxSpeakerLabels;
        if ((maxSpeakers as number) < 2 || (maxSpeakers as number) > 10) {
            return {
                verified: false,
                message: 'Max speakers must be between 2-10.',
            };
        }
    } else if (jobParams?.Settings?.ChannelIdentification) {
        if (jobParams?.ChannelDefinitions?.length !== 2) {
            return {
                verified: false,
                message: 'Channel definitions for clinician and patient must be specified.',
            };
        }
    }

    // Check output bucket
    if (!/[a-z0-9][.-a-z0-9]{1,61}[a-z0-9]/.test(jobParams.OutputBucketName!)) {
        return {
            verified: false,
            message: 'Output bucket must match [a-z0-9][.-a-z0-9]{1,61}[a-z0-9].',
        };
    }

    return {
        verified: true,
        message: '',
    };
}
