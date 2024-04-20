import React, { useMemo } from 'react';

import * as awsui from '@cloudscape-design/design-tokens';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import FormField from '@cloudscape-design/components/form-field';
import Modal from '@cloudscape-design/components/modal';
import SpaceBetween from '@cloudscape-design/components/space-between';

import { useAppSettingsContext } from '@/store/appSettings';

import { EnableComprehendMedicalPopover } from '../Common/ComprehendMedical';
import styles from './SummarizedConcepts.module.css';

type RightPanelActionsProps = {
    hasInsightSections: boolean;
    extractingData: boolean;
    setRightPanelSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleExtractHealthData: () => void;
};
export function RightPanelActions({
    hasInsightSections,
    extractingData,
    setRightPanelSettingsOpen,
    handleExtractHealthData,
}: RightPanelActionsProps) {
    const { comprehendMedicalEnabled } = useAppSettingsContext();

    const extractHealthDataEnabled = useMemo(
        () => hasInsightSections && comprehendMedicalEnabled,
        [hasInsightSections, comprehendMedicalEnabled]
    );

    return (
        <SpaceBetween size={'xs'} alignItems="center" direction={'horizontal'}>
            <Button iconName="settings" variant="icon" onClick={() => setRightPanelSettingsOpen(true)} />
            <Button
                disabled={!extractHealthDataEnabled}
                loading={extractingData}
                onClick={() => handleExtractHealthData()}
            >
                Extract Health Data
            </Button>
            <EnableComprehendMedicalPopover />
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
                <div className={styles.sliderContainer}>
                    <input
                        className={styles.slider}
                        style={{ background: awsui.colorBackgroundButtonNormalActive }}
                        type="range"
                        step={1}
                        min={0}
                        max={99}
                        value={acceptableConfidence}
                        onChange={(e) => setAcceptableConfidence(parseInt(e.target.value))}
                    />
                    <div>{acceptableConfidence}%</div>
                </div>
            </FormField>
        </Modal>
    );
}
