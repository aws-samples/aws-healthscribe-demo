// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// API
import { healthScribePost } from './awsSign';

export type ApiConfig = {
    region: string;
    apiTiming: boolean;
};

let apiConfig: ApiConfig = {
    region: '',
    apiTiming: false,
};

function updateConfig(newApiConfig: ApiConfig) {
    apiConfig = { ...apiConfig, ...newApiConfig };
}

function serviceEndpoint() {
    return `https://transcribe.${apiConfig.region}.amazonaws.com`;
}

export type ListHealthScribeJobsProps = {
    JobNameContains?: string;
    MaxResults?: number;
    NextToken?: string;
    Status?: 'ALL' | 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
};
async function listHealthScribeJobs({
    JobNameContains,
    MaxResults = 100,
    NextToken,
    Status,
}: ListHealthScribeJobsProps) {
    const listHealthScribeJobsReq = {
        ...(JobNameContains && { JobNameContains: JobNameContains }),
        ...(MaxResults && { MaxResults: MaxResults }),
        ...(NextToken && { NextToken: NextToken }),
        ...(Status && { Status: Status }),
    };

    return await healthScribePost({
        apiConfig: apiConfig,
        url: serviceEndpoint(),
        data: listHealthScribeJobsReq,
        headers: {
            'X-Amz-Target': 'Transcribe.ListMedicalScribeJobs',
        },
    });
}

export type GetHealthScribeJobProps = {
    MedicalScribeJobName: string;
};
async function getHealthScribeJob({ MedicalScribeJobName }: GetHealthScribeJobProps) {
    return await healthScribePost({
        apiConfig: apiConfig,
        url: serviceEndpoint(),
        data: {
            MedicalScribeJobName: MedicalScribeJobName,
        },
        headers: {
            'X-Amz-Target': 'Transcribe.GetMedicalScribeJob',
        },
    });
}

export type DeleteHealthScribeJobProps = {
    MedicalScribeJobName: string;
};
async function deleteHealthScribeJob({ MedicalScribeJobName }: GetHealthScribeJobProps) {
    return await healthScribePost({
        apiConfig: apiConfig,
        url: serviceEndpoint(),
        data: {
            MedicalScribeJobName: MedicalScribeJobName,
        },
        headers: {
            'X-Amz-Target': 'Transcribe.DeleteMedicalScribeJob',
        },
    });
}

async function startMedicalScribeJob(startMedicalScribeJobParams: object) {
    return await healthScribePost({
        apiConfig: apiConfig,
        url: serviceEndpoint(),
        data: startMedicalScribeJobParams,
        headers: {
            'X-Amz-Target': 'Transcribe.StartMedicalScribeJob',
        },
    });
}

export { updateConfig, listHealthScribeJobs, getHealthScribeJob, deleteHealthScribeJob, startMedicalScribeJob };
