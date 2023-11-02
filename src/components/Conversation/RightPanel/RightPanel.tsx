// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { MutableRefObject, useMemo } from 'react';

// Cloudscape
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';

// App
import {
    IAuraClinicalDocOutput,
    IAuraClinicalDocOutputSection,
    IAuraClinicalDocOutputSectionOld,
    IAuraTranscriptOutput,
    ITranscriptSegments,
} from '../../../types/HealthScribe';
import { HighlightId } from '../types';
import { Loading } from '../Common/Loading';
import SummarizedConceptsOld from './SummarizedConceptsOld';

// Audio
import WaveSurfer from 'wavesurfer.js';

import styles from './RightPanel.module.css';
import SummarizedConcepts from './SummarizedConcepts';

type RightPanelProps = {
    jobLoading: boolean;
    clinicalDocument: IAuraClinicalDocOutput | null;
    transcriptFile: IAuraTranscriptOutput | null;
    highlightId: HighlightId;
    setHighlightId: React.Dispatch<React.SetStateAction<HighlightId>>;
    wavesurfer: MutableRefObject<WaveSurfer | undefined>;
};

export default function RightPanel({
    jobLoading,
    clinicalDocument,
    transcriptFile,
    highlightId,
    setHighlightId,
    wavesurfer,
}: RightPanelProps) {
    const segmentById: { [key: string]: ITranscriptSegments } = useMemo(() => {
        if (transcriptFile == null) return {};
        return transcriptFile.Conversation.TranscriptSegments.reduce((acc, seg) => {
            return { ...acc, [seg.SegmentId]: seg };
        }, {});
    }, [transcriptFile]);

    // Changes in November 2023 - ClinicalDocumentation.Sections contains an array of SectionName and Summary
    // The previous style had "SUBJECTIVE" and "ASSESSMENT_AND_PLAN" subsections
    // Return true if clinicalDocument uses the new format
    const isNewSummarizationFormation = useMemo(() => {
        return (
            typeof clinicalDocument?.ClinicalDocumentation?.Sections?.[0] !== 'undefined' &&
            'Summary' in clinicalDocument.ClinicalDocumentation.Sections[0]
        );
    }, [clinicalDocument]);

    if (jobLoading || clinicalDocument == null) {
        return (
            <Container header={<Header variant="h2">Insights</Header>}>
                <Loading loading={jobLoading} text="Loading Insights" />
            </Container>
        );
    } else {
        return (
            <Container header={<Header variant="h2">Insights</Header>}>
                <div className={styles.insights}>
                    {isNewSummarizationFormation ? (
                        <SummarizedConcepts
                            sections={
                                clinicalDocument.ClinicalDocumentation.Sections as IAuraClinicalDocOutputSection[]
                            }
                            highlightId={highlightId}
                            setHighlightId={setHighlightId}
                            segmentById={segmentById}
                            wavesurfer={wavesurfer}
                        />
                    ) : (
                        <SummarizedConceptsOld
                            sections={
                                clinicalDocument.ClinicalDocumentation.Sections as IAuraClinicalDocOutputSectionOld[]
                            }
                            highlightId={highlightId}
                            setHighlightId={setHighlightId}
                            segmentById={segmentById}
                            wavesurfer={wavesurfer}
                        />
                    )}
                </div>
            </Container>
        );
    }
}
