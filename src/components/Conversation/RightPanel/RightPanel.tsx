// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useMemo, useState } from 'react';

import { DetectEntitiesV2Response } from '@aws-sdk/client-comprehendmedical';
import WaveSurfer from 'wavesurfer.js';

import LoadingContainer from '@/components/Conversation/Common/LoadingContainer';
import ScrollingContainer from '@/components/Conversation/Common/ScrollingContainer';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ExtractedHealthData } from '@/types/ComprehendMedical';
import {
    IAuraClinicalDocOutput,
    IAuraClinicalDocOutputSection,
    IAuraTranscriptOutput,
    ITranscriptSegments,
} from '@/types/HealthScribe';
import { detectEntitiesFromComprehendMedical } from '@/utils/ComprehendMedicalApi';

import { HighlightId } from '../types';
import { RightPanelActions, RightPanelSettings } from './RightPanelComponents';
import SummarizedConcepts from './SummarizedConcepts';
import { processSummarizedSegment } from './summarizedConceptsUtils';

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
    const [extractingData, setExtractingData] = useState<boolean>(false);
    const [extractedHealthData, setExtractedHealthData] = useState<ExtractedHealthData[]>([]);
    const [rightPanelSettingsOpen, setRightPanelSettingsOpen] = useState<boolean>(false);
    const [acceptableConfidence, setAcceptableConfidence] = useLocalStorage<number>(
        'Insights-Comprehend-Medical-Confidence-Threshold',
        75.0
    );

    const segmentById: { [key: string]: ITranscriptSegments } = useMemo(() => {
        if (transcriptFile == null) return {};
        return transcriptFile.Conversation.TranscriptSegments.reduce((acc, seg) => {
            return { ...acc, [seg.SegmentId]: seg };
        }, {});
    }, [transcriptFile]);

    const hasInsightSections: boolean = useMemo(() => {
        if (typeof clinicalDocument?.ClinicalDocumentation?.Sections === 'undefined') return false;
        return clinicalDocument?.ClinicalDocumentation?.Sections?.length > 0;
    }, [clinicalDocument]);

    async function handleExtractHealthData() {
        if (!Array.isArray(clinicalDocument?.ClinicalDocumentation?.Sections)) return;
        setExtractingData(true);

        const buildExtractedHealthData = [];
        for (const section of clinicalDocument.ClinicalDocumentation.Sections) {
            const sectionEntities: DetectEntitiesV2Response[] = [];
            for (const summary of section.Summary) {
                const summarizedSegment = processSummarizedSegment(summary.SummarizedSegment);
                const detectedEntities = (await detectEntitiesFromComprehendMedical(
                    summarizedSegment
                )) as DetectEntitiesV2Response;
                sectionEntities.push(detectedEntities);
            }
            buildExtractedHealthData.push({
                SectionName: section.SectionName,
                ExtractedEntities: sectionEntities,
            });
        }
        setExtractedHealthData(buildExtractedHealthData);

        setExtractingData(false);
    }

    if (jobLoading || clinicalDocument == null) {
        return <LoadingContainer containerTitle="Insights" text="Loading Insights" />;
    } else {
        return (
            <ScrollingContainer
                containerTitle="Insights"
                containerActions={
                    <RightPanelActions
                        hasInsightSections={hasInsightSections}
                        extractingData={extractingData}
                        setRightPanelSettingsOpen={setRightPanelSettingsOpen}
                        handleExtractHealthData={handleExtractHealthData}
                    />
                }
            >
                <RightPanelSettings
                    rightPanelSettingsOpen={rightPanelSettingsOpen}
                    setRightPanelSettingsOpen={setRightPanelSettingsOpen}
                    acceptableConfidence={acceptableConfidence}
                    setAcceptableConfidence={setAcceptableConfidence}
                />
                <SummarizedConcepts
                    sections={clinicalDocument.ClinicalDocumentation.Sections as IAuraClinicalDocOutputSection[]}
                    extractedHealthData={extractedHealthData}
                    acceptableConfidence={acceptableConfidence}
                    highlightId={highlightId}
                    setHighlightId={setHighlightId}
                    segmentById={segmentById}
                    wavesurfer={wavesurfer}
                />
            </ScrollingContainer>
        );
    }
}
