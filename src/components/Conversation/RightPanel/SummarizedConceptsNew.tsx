// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useEffect, useState } from 'react';

import Box from '@cloudscape-design/components/box';
import Header from '@cloudscape-design/components/header';

import toast from 'react-hot-toast';
import WaveSurfer from 'wavesurfer.js';

import { IAuraClinicalDocOutputSectionNew, ITranscriptSegments } from '@/types/HealthScribe';
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

    return (
        <>
            {sections.map(({ SectionName, Summary }, i) => {
                return (
                    <div key={i}>
                        <Header variant="h3">{toTitleCase(SectionName.replace(/_/g, ' '))}</Header>
                        {Summary.length ? (
                            <ul className={styles.summaryList}>
                                {Summary.map(({ EvidenceLinks, SummarizedSegment }, index) => {
                                    return (
                                        <li key={index}>
                                            <button
                                                style={{
                                                    lineHeight: 'normal',
                                                    backgroundColor:
                                                        currentSegment === SummarizedSegment
                                                            ? 'rgba(204, 218, 255, 0.6)'
                                                            : '',
                                                }}
                                                onClick={() => handleClick(SummarizedSegment, EvidenceLinks)}
                                            >
                                                {SummarizedSegment}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div style={{ paddingLeft: '5px' }}>
                                <Box variant="small">No Clinical Entities</Box>
                            </div>
                        )}
                    </div>
                );
            })}
        </>
    );
}
