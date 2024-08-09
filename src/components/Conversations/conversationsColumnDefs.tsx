// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';

import { Link } from 'react-router-dom';

import StatusIndicator from '@cloudscape-design/components/status-indicator';
import TextContent from '@cloudscape-design/components/text-content';

import { MedicalScribeJobSummary } from '@aws-sdk/client-transcribe';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

import toTitleCase from '@/utils/toTitleCase';

dayjs.extend(duration);

function JobName(healthScribeJob: MedicalScribeJobSummary) {
    if (healthScribeJob.MedicalScribeJobStatus === 'COMPLETED') {
        return (
            <TextContent>
                <Link to={`/conversation/${healthScribeJob.MedicalScribeJobName}`}>
                    {healthScribeJob.MedicalScribeJobName}
                </Link>
            </TextContent>
        );
    } else {
        return healthScribeJob.MedicalScribeJobName;
    }
}

function JobStatus(status: string) {
    switch (status) {
        case 'COMPLETED':
            return <StatusIndicator>Completed</StatusIndicator>;
        case 'FAILED':
            return <StatusIndicator type="error">Failed</StatusIndicator>;
        case 'IN_PROGRESS':
            return <StatusIndicator type="in-progress">In progress</StatusIndicator>;
        case 'QUEUED':
            return <StatusIndicator type="pending">Queued</StatusIndicator>;
        default:
            return <StatusIndicator type="info">{toTitleCase(status)}</StatusIndicator>;
    }
}

export const columnDefs = [
    {
        id: 'MedicalScribeJobName',
        header: 'Name',
        cell: (e: MedicalScribeJobSummary) => JobName(e),
        sortingField: 'MedicalScribeJobName',
        width: 300,
    },
    {
        id: 'MedicalScribeJobStatus',
        header: 'Status',
        cell: (e: MedicalScribeJobSummary) => JobStatus(e.MedicalScribeJobStatus || ''),
        sortingField: 'MedicalScribeJobStatus',
    },
    {
        id: 'CreationTime',
        header: 'Created',
        cell: (e: MedicalScribeJobSummary) => dayjs(e.CreationTime!.toString()).format('MMMM D YYYY, H:mm'),
        sortingField: 'CreationTime',
    },
    {
        id: 'ExpiresIn',
        header: 'Expires In',
        cell: (e: MedicalScribeJobSummary) =>
            e.CompletionTime ? dayjs(e.CompletionTime).add(90, 'day').diff(dayjs(), 'day') + ' days' : '-',
        sortingField: 'CompletionTime',
    },
    // objects below here are not shown by default
    {
        id: 'LanguageCode',
        header: 'Language',
        cell: (e: MedicalScribeJobSummary) => e.LanguageCode,
        sortingField: 'LanguageCode',
        width: 135,
    },
    {
        id: 'CompletionTime',
        header: 'Completed',
        cell: (e: MedicalScribeJobSummary) => dayjs(e.CompletionTime).format('MMMM D YYYY, H:mm'),
        sortingField: 'CompletionTime',
    },
    {
        id: 'Duration',
        header: 'Duration',
        cell: (e: MedicalScribeJobSummary) =>
            typeof e.CompletionTime?.getTime === 'function' && typeof e.StartTime?.getTime === 'function'
                ? dayjs.duration(e.CompletionTime!.getTime() - e.CreationTime!.getTime()).format('mm:ss')
                : '-',
        sortingField: 'Duration',
    },
    {
        id: 'FailureReason',
        header: 'Failure Reason',
        cell: (e: MedicalScribeJobSummary) => e.FailureReason,
        sortingField: 'FailureReason',
    },
];
