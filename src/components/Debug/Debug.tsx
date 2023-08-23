// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useContext } from 'react';

// Cloudscape
import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';

// App
import { NotificationContext } from '../App/contexts';

// API
import { getHealthScribeJob, listHealthScribeJobs } from '../../utils/HealthScribeApi';

export default function Debug() {
    const { addFlashMessage } = useContext(NotificationContext);

    async function listJobs() {
        const scribeJobs = await listHealthScribeJobs({});
        console.debug('scribeJobs', scribeJobs);
    }

    async function getJob() {
        const jobDetails = await getHealthScribeJob({ MedicalScribeJobName: 'TestJob' });
        console.debug('jobDetails', jobDetails);
    }

    function addNotification() {
        addFlashMessage({
            id: 'test',
            header: 'Test notification',
            content: 'Test notification',
            type: 'success',
        });
    }

    return (
        <ContentLayout header={<Header variant="h1">Debug</Header>}>
            <Container>
                <SpaceBetween direction="horizontal" size="m">
                    <Button onClick={() => listJobs()}>List HealthScribe Jobs</Button>
                    <Button onClick={() => getJob()}>Get Job</Button>
                    <Button onClick={() => addNotification()}>Add Notification</Button>
                </SpaceBetween>
            </Container>
        </ContentLayout>
    );
}
