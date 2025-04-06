import React, { useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import Box from '@cloudscape-design/components/box';
import Link from '@cloudscape-design/components/link';
import Popover from '@cloudscape-design/components/popover';
import StatusIndicator from '@cloudscape-design/components/status-indicator';

import ValueWithLabel from '@/components/Common/ValueWithLabel';
import { useAppSettingsContext } from '@/store/appSettings';

export function EnableComprehendMedicalPopover() {
    const { appSettings } = useAppSettingsContext();
    const navigate = useNavigate();

    const comprehendMedicalEnabled = useMemo(() => appSettings['app.comprehendMedicalEnabled'], [appSettings]);

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

type ComprehendMedicalNereCostProps = {
    clinicalDocumentNereUnits: 0 | { [key: string]: number };
};
export function ComprehendMedicalNereCost({ clinicalDocumentNereUnits }: ComprehendMedicalNereCostProps) {
    const { appSettings } = useAppSettingsContext();
    const comprehendMedicalEnabled = useMemo(() => appSettings['app.comprehendMedicalEnabled'], [appSettings]);

    if (comprehendMedicalEnabled && clinicalDocumentNereUnits !== 0) {
        return (
            <Popover
                header="Comprehend Medical"
                content={
                    <Box>
                        <ValueWithLabel label={'Entity Extraction Estimated Cost'}>
                            ${(clinicalDocumentNereUnits.eachSegment * 0.01).toFixed(2)}
                        </ValueWithLabel>
                        <p>
                            This demo uses the Medical Named Entity and Relationship Extraction (NERe) functionality of{' '}
                            <Link external href="https://aws.amazon.com/comprehend/medical/">
                                Amazon Comprehend Medical
                            </Link>{' '}
                            to extract data one insight at a time.
                        </p>
                        <p>
                            The estimated cost for calling the NERe API for each section is{' '}
                            <b>${(clinicalDocumentNereUnits.eachSection * 0.01).toFixed(2)}</b>, and for the entire
                            summary, <b>${(clinicalDocumentNereUnits.allAtOnce * 0.01).toFixed(2)}</b>.
                        </p>
                        <p>
                            Refer to the{' '}
                            <Link external href="https://aws.amazon.com/comprehend/medical/pricing">
                                Amazon Comprehend Medical pricing page
                            </Link>{' '}
                            to learn more about pricing tiers, including free tier.{' '}
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
