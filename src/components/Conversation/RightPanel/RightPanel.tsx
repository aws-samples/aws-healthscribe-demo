// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { RefObject, useCallback, useMemo, useState } from 'react';

import { DetectEntitiesV2Response } from '@aws-sdk/client-comprehendmedical';
import WaveSurfer from 'wavesurfer.js';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ExtractedHealthData } from '@/types/ComprehendMedical';
import { IHealthScribeSummary, ISection } from '@/types/HealthScribeSummary';
import { IHealthScribeTranscript, ITranscriptSegment } from '@/types/HealthScribeTranscript';
import { detectEntitiesFromComprehendMedical } from '@/utils/ComprehendMedicalApi';

import LoadingContainer from '../Common/LoadingContainer';
import ScrollingContainer from '../Common/ScrollingContainer';
import { HighlightId } from '../types';
import { RightPanelActions, RightPanelSettings } from './RightPanelComponents';
import SummarizedConcepts from './SummarizedConcepts';
import { calculateNereUnits } from './rightPanelUtils';
import { processSummarizedSegment } from './summarizedConceptsUtils';

type RightPanelProps = {
    jobLoading: boolean;
    summary: IHealthScribeSummary | undefined;
    transcript: IHealthScribeTranscript | undefined;
    highlightId: HighlightId;
    setHighlightId: React.Dispatch<React.SetStateAction<HighlightId>>;
    wavesurfer: RefObject<WaveSurfer | undefined>;
};

export default function RightPanel({
    jobLoading,
    summary,
    transcript,
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

    const segmentById: { [key: string]: ITranscriptSegment } = useMemo(() => {
        if (transcript == null) return {};
        return transcript.Conversation.TranscriptSegments.reduce((acc, seg) => {
            return { ...acc, [seg.SegmentId]: seg };
        }, {});
    }, [transcript]);

    const hasInsightSections: boolean = useMemo(() => {
        if (typeof summary?.ClinicalDocumentation?.Sections === 'undefined') return false;
        return summary?.ClinicalDocumentation?.Sections?.length > 0;
    }, [summary]);

    const handleExtractHealthData = useCallback(async () => {
        if (!Array.isArray(summary?.ClinicalDocumentation?.Sections)) return;
        setExtractingData(true);

        const buildExtractedHealthData = [];
        for (const section of summary.ClinicalDocumentation.Sections) {
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
    }, [summary, setExtractingData, setExtractedHealthData]);

    // Calculate the number of CM units (100-character segments) in the clinical document.
    const clinicalDocumentNereUnits = useMemo(() => calculateNereUnits(summary), [summary]);

    if (jobLoading || summary == null) {
        return <LoadingContainer containerTitle="Insights" text="Loading Insights" />;
    } else {
        return (
            <ScrollingContainer
                containerTitle="Insights"
                containerActions={
                    <RightPanelActions
                        hasInsightSections={hasInsightSections}
                        dataExtracted={extractedHealthData.length > 0}
                        extractingData={extractingData}
                        clinicalDocumentNereUnits={clinicalDocumentNereUnits}
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
                    sections={summary.ClinicalDocumentation.Sections as ISection[]}
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
