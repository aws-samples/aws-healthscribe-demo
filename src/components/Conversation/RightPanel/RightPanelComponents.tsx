import React, { useMemo } from 'react';

import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import FormField from '@cloudscape-design/components/form-field';
import Modal from '@cloudscape-design/components/modal';
import Slider from '@cloudscape-design/components/slider';
import SpaceBetween from '@cloudscape-design/components/space-between';

import { useAppSettingsContext } from '@/store/appSettings';

import { ComprehendMedicalNereCost, EnableComprehendMedicalPopover } from '../Common/ComprehendMedical';

type RightPanelActionsProps = {
    hasInsightSections: boolean;
    dataExtracted: boolean;
    extractingData: boolean;
    clinicalDocumentNereUnits: 0 | { [key: string]: number };
    setRightPanelSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleExtractHealthData: () => void;
};
export function RightPanelActions({
    hasInsightSections,
    dataExtracted,
    extractingData,
    clinicalDocumentNereUnits,
    setRightPanelSettingsOpen,
    handleExtractHealthData,
}: RightPanelActionsProps) {
    const { appSettings } = useAppSettingsContext();
    const comprehendMedicalEnabled = useMemo(() => appSettings['app.comprehendMedicalEnabled'], [appSettings]);

    const extractHealthDataEnabled = useMemo(
        () => hasInsightSections && comprehendMedicalEnabled,
        [hasInsightSections, comprehendMedicalEnabled]
    );

    return (
        <SpaceBetween size={'xs'} alignItems="center" direction={'horizontal'}>
            <Button iconName="settings" variant="icon" onClick={() => setRightPanelSettingsOpen(true)} />
            <Button
                disabled={!extractHealthDataEnabled || dataExtracted}
                loading={extractingData}
                onClick={() => handleExtractHealthData()}
            >
                Extract Health Data
            </Button>
            <EnableComprehendMedicalPopover />
            <ComprehendMedicalNereCost clinicalDocumentNereUnits={clinicalDocumentNereUnits} />
        </SpaceBetween>
    );
}

type RightPanelSettingsProps = {
    rightPanelSettingsOpen: boolean;
    setRightPanelSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    acceptableConfidence: number;
    setAcceptableConfidence: (confidence: number) => void;
};
export function RightPanelSettings({
    rightPanelSettingsOpen,
    setRightPanelSettingsOpen,
    acceptableConfidence,
    setAcceptableConfidence,
}: RightPanelSettingsProps) {
    return (
        <Modal
            onDismiss={() => setRightPanelSettingsOpen(false)}
            visible={rightPanelSettingsOpen}
            footer={
                <Box>
                    <Button variant="link" onClick={() => setAcceptableConfidence(75)}>
                        Reset to Defaults
                    </Button>
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={() => setRightPanelSettingsOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={() => setRightPanelSettingsOpen(false)}>
                                OK
                            </Button>
                        </SpaceBetween>
                    </Box>
                </Box>
            }
            header="Insights Settings"
        >
            <FormField
                label="Comprehend Medical Confidence Score Threshold"
                description="Extracted medical entities with confidence scores lower than this are not shown."
            >
                <Slider
                    onChange={({ detail }) => setAcceptableConfidence(detail.value)}
                    value={acceptableConfidence}
                    max={99}
                    min={0}
                />
            </FormField>
        </Modal>
    );
}
