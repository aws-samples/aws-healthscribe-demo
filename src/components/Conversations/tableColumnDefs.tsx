// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// Cloudscape
import StatusIndicator from '@cloudscape-design/components/status-indicator';

// App
import toTitleCase from '../../utils/toTitleCase';
import { HealthScribeJob } from './Conversations';
import dayjs from 'dayjs';

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
            <StatusIndicator type="info">{toTitleCase(status)}</StatusIndicator>;
    }
}

export const columnDefs = [
    {
        id: 'MedicalScribeJobName',
        header: 'Name',
        cell: (e: HealthScribeJob) => e.MedicalScribeJobName,
        sortingField: 'MedicalScribeJobName',
    },
    {
        id: 'MedicalScribeJobStatus',
        header: 'Status',
        cell: (e: HealthScribeJob) => JobStatus(e.MedicalScribeJobStatus),
        sortingField: 'MedicalScribeJobStatus',
    },
    {
        id: 'LanguageCode',
        header: 'Language',
        cell: (e: HealthScribeJob) => e.LanguageCode,
        sortingField: 'LanguageCode',
    },
    {
        id: 'CreationTime',
        header: 'Created',
        cell: (e: HealthScribeJob) => dayjs.unix(e.CreationTime).format('MMMM D YYYY, H:mm'),
        sortingField: 'CreationTime',
    },
    {
        id: 'ExpiresIn',
        header: 'Expires In',
        cell: (e: HealthScribeJob) =>
            e.CompletionTime ? dayjs.unix(e.CompletionTime).add(90, 'day').diff(dayjs(), 'day') + ' days' : '-',
        sortingField: 'CompletionTime',
    },
    // TODO: add a popover that does a getHealthScribeJob
    // objects below here are not shown by default
    {
        id: 'CompletionTime',
        header: 'Completed',
        cell: (e: HealthScribeJob) => dayjs.unix(e.CompletionTime).format('MMMM D YYYY, H:mm'),
        sortingField: 'CompletionTime',
    },
    {
        id: 'FailureReason',
        header: 'Failure Reason',
        cell: (e: HealthScribeJob) => e.FailureReason,
        sortingField: 'FailureReason',
    },
];
