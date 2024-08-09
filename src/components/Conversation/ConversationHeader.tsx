// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';

import Button from '@cloudscape-design/components/button';
import ButtonDropdown from '@cloudscape-design/components/button-dropdown';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';

import { MedicalScribeJob } from '@aws-sdk/client-transcribe';

import { getPresignedUrl, getS3Object } from '@/utils/S3Api';

type ConversationHeaderProps = {
    jobDetails: MedicalScribeJob | null;
    setShowOutputModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export function ConversationHeader({ jobDetails, setShowOutputModal }: ConversationHeaderProps) {
    async function openUrl(detail: { id: string }) {
        let jobUrl: string = '';
        if (detail.id === 'audio') {
            jobUrl = jobDetails?.Media?.MediaFileUri as string;
        } else if (detail.id === 'transcript') {
            jobUrl = jobDetails?.MedicalScribeOutput?.TranscriptFileUri as string;
        } else if (detail.id === 'summary') {
            jobUrl = jobDetails?.MedicalScribeOutput?.ClinicalDocumentUri as string;
        }
        if (jobUrl) {
            const presignedUrl = await getPresignedUrl(getS3Object(jobUrl));
            window.open(presignedUrl, '_blank');
        }
    }

    return (
        <Header
            variant="awsui-h1-sticky"
            actions={
                <SpaceBetween direction="horizontal" size="xs">
                    <ButtonDropdown
                        items={[
                            { text: 'Audio', id: 'audio' },
                            { text: 'Transcript', id: 'transcript' },
                            { text: 'Summary', id: 'summary' },
                        ]}
                        onItemClick={({ detail }) => openUrl(detail)}
                    >
                        Download
                    </ButtonDropdown>
                    <Button onClick={() => setShowOutputModal(true)}>View HealthScribe Output</Button>
                </SpaceBetween>
            }
        >
            {jobDetails?.MedicalScribeJobName}
        </Header>
    );
}
