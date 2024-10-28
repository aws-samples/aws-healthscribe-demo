// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import Grid from '@cloudscape-design/components/grid';
import RadioGroup from '@cloudscape-design/components/radio-group';
import SpaceBetween from '@cloudscape-design/components/space-between';

import { useAuthContext } from '@/store/auth';

export default function WelcomeHeader() {
    const navigate = useNavigate();
    const { isUserAuthenticated } = useAuthContext();
    const [getStartedSelection, setGetStartedSelection] = useState<string>('conversations');

    const getStartedSelectionText = useMemo(() => {
        if (getStartedSelection === 'conversations') {
            return 'View Appointments';
        } else if (getStartedSelection === 'newConversation') {
            return 'Create Conversation';
        } else if (getStartedSelection === 'generateAudio') {
            return 'Generate Synthetic Audio';
        } else {
            return 'Go';
        }
    }, [getStartedSelection]);

    function handleGetStartedClick() {
        if (getStartedSelection === 'conversations') {
            navigate('/conversations');
        } else if (getStartedSelection === 'newConversation') {
            navigate('/new');
        } else if (getStartedSelection === 'generateAudio') {
            navigate('/generate');
        }
    }

    return (
        <Box padding={{ top: 'xs', bottom: 'l' }}>
            <Grid
                gridDefinition={[{ colspan: { default: 12, xs: 7, s: 8 } }, { colspan: { default: 12, xs: 5, s: 4 } }]}
            >
                <SpaceBetween size="xl">
                    <Box fontSize="display-l" fontWeight="bold">
                        Demo Application Experience
                    </Box>
                    <Box fontSize="display-l">Powered by AWS HealthScribe</Box>
                </SpaceBetween>

                <div>
                    {isUserAuthenticated && (
                        <Container>
                            <SpaceBetween size="l">
                                <Box variant="h1" fontWeight="heavy" padding="n" fontSize="heading-m">
                                    Get started
                                </Box>
                                <RadioGroup
                                    onChange={({ detail }) => setGetStartedSelection(detail.value)}
                                    value={getStartedSelection}
                                    items={[
                                        {
                                            value: 'conversations',
                                            label: 'Appointments',
                                            description: 'View available conversations',
                                        },
                                        {
                                            value: 'newConversation',
                                            label: 'New Appointment',
                                            description: 'Record or submit new audio',
                                        },
                                        {
                                            value: 'generateAudio',
                                            label: 'Generate Audio',
                                            description: 'Generate multi-speaker synthetic audio',
                                        },
                                    ]}
                                />
                                <Button variant="primary" onClick={() => handleGetStartedClick()}>
                                    {getStartedSelectionText}
                                </Button>
                            </SpaceBetween>
                        </Container>
                    )}
                </div>
            </Grid>
        </Box>
    );
}
