// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useState } from 'react';

import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Modal from '@cloudscape-design/components/modal';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Spinner from '@cloudscape-design/components/spinner';

import { MedicalScribeJobSummary } from '@aws-sdk/client-transcribe';

import { useNotificationsContext } from '@/store/notifications';
import { deleteHealthScribeJob } from '@/utils/HealthScribeApi';

type DeleteModalProps = {
    selectedHealthScribeJob: MedicalScribeJobSummary[];
    deleteModalActive: boolean;
    setDeleteModalActive: React.Dispatch<React.SetStateAction<boolean>>;
    refreshTable: () => void;
};

export function DeleteConversation({
    selectedHealthScribeJob,
    deleteModalActive,
    setDeleteModalActive,
    refreshTable,
}: DeleteModalProps) {
    const { addFlashMessage } = useNotificationsContext();
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    async function doDelete(medicalScribeJobName: string) {
        if (!medicalScribeJobName) return;
        setIsDeleting(true);
        try {
            await deleteHealthScribeJob({ MedicalScribeJobName: medicalScribeJobName });
            refreshTable();
        } catch (err) {
            addFlashMessage({
                id: err?.toString() || 'Error deleting HealthScribe job',
                header: 'Error deleting HealthScribe job',
                content: err?.toString() || 'Error deleting HealthScribe job',
                type: 'error',
            });
        }
        setDeleteModalActive(false);
        setIsDeleting(false);
    }

    return (
        <Modal
            onDismiss={() => setDeleteModalActive(false)}
            visible={deleteModalActive}
            footer={
                <Box float="right">
                    <SpaceBetween direction="horizontal" size="xs">
                        <Button variant="link" disabled={isDeleting} onClick={() => setDeleteModalActive(false)}>
                            Cancel
                        </Button>
                        <Button
                            disabled={isDeleting}
                            variant="primary"
                            onClick={() => doDelete(selectedHealthScribeJob?.[0]?.MedicalScribeJobName || '')}
                        >
                            {isDeleting ? <Spinner /> : 'Delete'}
                        </Button>
                    </SpaceBetween>
                </Box>
            }
            header="Delete AWS HealthScribe Conversation"
        >
            <p>
                Permanently delete <strong>{selectedHealthScribeJob?.[0]?.MedicalScribeJobName || ''}</strong>. You
                cannot undo this action.
            </p>
            <Alert statusIconAriaLabel="Info">
                Proceeding with this action will delete the conversation but not the associated data (audio file,
                results JSON) from S3.
            </Alert>
        </Modal>
    );
}
