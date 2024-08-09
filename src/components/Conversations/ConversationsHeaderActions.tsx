// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';

import { MedicalScribeJobSummary } from '@aws-sdk/client-transcribe';

import { DeleteConversation } from './DeleteConversation';

type TableHeaderActionsProps = {
    selectedHealthScribeJob: MedicalScribeJobSummary[];
    refreshTable: () => void;
};
export function ConversationsHeaderActions({ selectedHealthScribeJob, refreshTable }: TableHeaderActionsProps) {
    const navigate = useNavigate();

    const [deleteModalActive, setDeleteModalActive] = useState<boolean>(false);

    // Disable HealthScribeJob action buttons (view metadata, view images) if nothing is selected
    const actionButtonDisabled = useMemo(
        () =>
            selectedHealthScribeJob.length === 0 ||
            !['COMPLETED', 'FAILED'].includes(selectedHealthScribeJob[0].MedicalScribeJobStatus || ''),
        [selectedHealthScribeJob]
    );

    return (
        <>
            <DeleteConversation
                selectedHealthScribeJob={selectedHealthScribeJob}
                deleteModalActive={deleteModalActive}
                setDeleteModalActive={setDeleteModalActive}
                refreshTable={refreshTable}
            />
            <SpaceBetween direction="horizontal" size="s">
                <Button onClick={() => refreshTable()} iconName="refresh" />
                <Button onClick={() => setDeleteModalActive(true)} disabled={actionButtonDisabled}>
                    Delete
                </Button>
                <Button
                    variant={'primary'}
                    disabled={selectedHealthScribeJob.length === 0}
                    onClick={() => navigate(`/conversation/${selectedHealthScribeJob[0].MedicalScribeJobName}`)}
                >
                    View
                </Button>
            </SpaceBetween>
        </>
    );
}
