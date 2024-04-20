import React from 'react';

import { useNavigate } from 'react-router-dom';

import Box from '@cloudscape-design/components/box';
import Link from '@cloudscape-design/components/link';
import Popover from '@cloudscape-design/components/popover';
import StatusIndicator from '@cloudscape-design/components/status-indicator';

import { useAppSettingsContext } from '@/store/appSettings';

export function EnableComprehendMedicalPopover() {
    const { comprehendMedicalEnabled } = useAppSettingsContext();
    const navigate = useNavigate();

    if (!comprehendMedicalEnabled) {
        return (
            <Popover
                header="Comprehend Medical"
                content={
                    <Box>
                        <p>
                            <Link external href="https://aws.amazon.com/comprehend/medical/">
                                Amazon Comprehend Medical
                            </Link>{' '}
                            is a healthcare natural language processing service (NLP) that uses machine learning to
                            identify and extract information from medical text.
                        </p>
                        <p>
                            <Link
                                variant={'secondary'}
                                onFollow={(e) => {
                                    e.preventDefault();
                                    navigate('/settings');
                                }}
                            >
                                Enable Amazon Comprehend Medical
                            </Link>{' '}
                            in the app settings to use this feature.
                        </p>
                    </Box>
                }
            >
                <StatusIndicator type="info" />
            </Popover>
        );
    } else {
        return false;
    }
}
