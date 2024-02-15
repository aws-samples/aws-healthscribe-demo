// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useEffect, useMemo, useState } from 'react';

import * as awsui from '@cloudscape-design/design-tokens';
import Box from '@cloudscape-design/components/box';
import TextContent from '@cloudscape-design/components/text-content';

import toast from 'react-hot-toast';
import WaveSurfer from 'wavesurfer.js';

import {
    processSections,
    processSummarizedSegment,
} from '@/components/Conversation/RightPanel/summarizedConceptsUtils';
import { IAuraClinicalDocOutputSectionNew, IEvidenceNew, ITranscriptSegments } from '@/types/HealthScribe';
import toTitleCase from '@/utils/toTitleCase';

import { HighlightId } from '../types';
import styles from './SummarizedConcepts.module.css';

type SummarizedConceptsProps = {
    sections: IAuraClinicalDocOutputSectionNew[];
    highlightId: HighlightId;
    setHighlightId: React.Dispatch<React.SetStateAction<HighlightId>>;
    segmentById: {
        [key: string]: ITranscriptSegments;
    };
    wavesurfer: React.MutableRefObject<WaveSurfer | undefined>;
};

export default function SummarizedConceptsNew({
    sections,
    highlightId,
    setHighlightId,
    segmentById,
    wavesurfer,
}: SummarizedConceptsProps) {
    const [currentId, setCurrentId] = useState(0);
    const [currentSegment, setCurrentSegment] = useState<string>('');

    // Unset current segment when the highlight is removed, i.e. the current audio time is outside the summarization
    useEffect(() => {
        if (!highlightId.selectedSegmentId) setCurrentSegment('');
    }, [highlightId]);

    function handleClick(SummarizedSegment: string, EvidenceLinks: { SegmentId: string }[]) {
        let currentIdLocal = currentId;
        if (currentSegment !== SummarizedSegment) {
            setCurrentSegment(SummarizedSegment);
            setCurrentId(0);
            currentIdLocal = 0;
        }
        const id = EvidenceLinks[currentIdLocal].SegmentId;
        // Set state back to Conversation, used to highlight the transcript in LeftPanel
        const newHighlightId = {
            allSegmentIds: EvidenceLinks.map((i) => i.SegmentId),
            selectedSegmentId: id,
        };
        setHighlightId(newHighlightId);

        const current = wavesurfer.current?.getDuration();
        const toastId = currentIdLocal + 1;
        if (current) {
            const seekId = segmentById[id].BeginAudioTime / current;
            wavesurfer.current?.seekTo(seekId);
            if (currentIdLocal < EvidenceLinks.length - 1) {
                setCurrentId(currentIdLocal + 1);
            } else {
                setCurrentId(0);
            }

            toast.success(`Jump Successful. Sentence ${toastId} of ${EvidenceLinks.length}`);
        } else if (!current) {
            if (currentIdLocal < EvidenceLinks.length - 1) {
                setCurrentId(currentIdLocal + 1);
            } else {
                setCurrentId(0);
            }
            toast.success(`Jump Successful. Sentence ${toastId} of ${EvidenceLinks.length}. Audio not yet ready`);
        } else {
            toast.error('Unable to jump to that Clinical Attribute');
        }
    }

    /**
     * Create a memoized copy of sections processed for headers
     */
    const processedSections = useMemo(() => processSections(sections), [sections]);

    type SummaryListProps = {
        summary: IEvidenceNew[];
        level?: number;
    };
    function SummaryList({ summary, level = 0 }: SummaryListProps) {
        let listStyle = {};
        if (level <= 0) {
            listStyle = {
                paddingLeft: '0px',
            };
        } else if (level === 1) {
            listStyle = {
                paddingLeft: '20px',
            };
        }
        if (summary.length) {
            return (
                <ul className={styles.summaryList} style={listStyle}>
                    {summary.map(({ EvidenceLinks, SummarizedSegment }, index) => {
                        return (
                            <li key={index} className={styles.summaryList}>
                                <div
                                    onClick={() => handleClick(SummarizedSegment, EvidenceLinks)}
                                    className={styles.summarizedSegment}
                                    style={{
                                        color: awsui.colorTextBodyDefault,
                                        backgroundColor:
                                            currentSegment === SummarizedSegment
                                                ? awsui.colorBackgroundToggleCheckedDisabled
                                                : '',
                                    }}
                                >
                                    {processSummarizedSegment(SummarizedSegment)}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            );
        } else {
            return (
                <div style={{ paddingLeft: '5px' }}>
                    <Box variant="small">No Clinical Entities</Box>
                </div>
            );
        }
    }

    return (
        <>
            {processedSections.map(({ SectionName, Summary }, i) => {
                return (
                    <div key={`insightsSection_${i}`}>
                        <TextContent>
                            <h3>{toTitleCase(SectionName.replace(/_/g, ' '))}</h3>
                        </TextContent>
                        {Summary.constructor.name === 'Array' ? (
                            <SummaryList summary={Summary as IEvidenceNew[]} level={0} />
                        ) : (
                            <ul className={`${styles.summaryList} ${styles.summaryListWithSectionHeader}`}>
                                {Object.keys(Summary).map((summaryHeader) => (
                                    <div key={`insightsSummary_${summaryHeader.replace(' ', '')}`}>
                                        <TextContent>
                                            <p>{summaryHeader}</p>
                                        </TextContent>
                                        <SummaryList
                                            summary={
                                                (Summary as { [header: string]: IEvidenceNew[] })[
                                                    summaryHeader
                                                ] as IEvidenceNew[]
                                            }
                                            level={1}
                                        />
                                    </div>
                                ))}
                            </ul>
                        )}
                    </div>
                );
            })}
        </>
    );
}
