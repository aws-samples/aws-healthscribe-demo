// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useMemo } from 'react';

import WaveSurfer from 'wavesurfer.js';

import LoadingContainer from '@/components/Conversation/Common/LoadingContainer';
import ScrollingContainer from '@/components/Conversation/Common/ScrollingContainer';
import {
    IAuraClinicalDocOutput,
    IAuraClinicalDocOutputSection,
    IAuraClinicalDocOutputSectionNew,
    IAuraTranscriptOutput,
    ITranscriptSegments,
} from '@/types/HealthScribe';

import { HighlightId } from '../types';
import SummarizedConcepts from './SummarizedConcepts';
import SummarizedConceptsNew from './SummarizedConceptsNew';

type RightPanelProps = {
    jobLoading: boolean;
    clinicalDocument: IAuraClinicalDocOutput | null;
    transcriptFile: IAuraTranscriptOutput | null;
    highlightId: HighlightId;
    setHighlightId: React.Dispatch<React.SetStateAction<HighlightId>>;
    wavesurfer: React.MutableRefObject<WaveSurfer | undefined>;
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
        return <LoadingContainer containerTitle="Insights" text="Loading Insights" />;
    } else {
        return (
            <ScrollingContainer containerTitle="Insights">
                {isNewSummarizationFormation ? (
                    <SummarizedConceptsNew
                        sections={clinicalDocument.ClinicalDocumentation.Sections as IAuraClinicalDocOutputSectionNew[]}
                        highlightId={highlightId}
                        setHighlightId={setHighlightId}
                        segmentById={segmentById}
                        wavesurfer={wavesurfer}
                    />
                ) : (
                    <SummarizedConcepts
                        sections={clinicalDocument.ClinicalDocumentation.Sections as IAuraClinicalDocOutputSection[]}
                        highlightId={highlightId}
                        setHighlightId={setHighlightId}
                        segmentById={segmentById}
                        wavesurfer={wavesurfer}
                    />
                )}
            </ScrollingContainer>
        );
    }
}
