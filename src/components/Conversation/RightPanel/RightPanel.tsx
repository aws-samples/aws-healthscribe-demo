// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { MutableRefObject, useMemo } from 'react';

// Cloudscape
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Tabs from '@cloudscape-design/components/tabs';

// App
import { IAuraClinicalDocOutput, IAuraTranscriptOutput, ITranscriptSegments } from '../../../types/HealthScribe';
import { HighlightId } from '../types';
import { Loading } from '../Common/Loading';
import SummarizedConcepts from './SummarizedConcepts';

// Audio
import WaveSurfer from 'wavesurfer.js';

import styles from './RightPanel.module.css';

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
                    <Tabs
                        tabs={[
                            {
                                label: 'Summarizations',
                                id: '1',
                                content: (
                                    <SummarizedConcepts
                                        sections={clinicalDocument.ClinicalDocumentation.Sections}
                                        highlightId={highlightId}
                                        setHighlightId={setHighlightId}
                                        segmentById={segmentById}
                                        wavesurfer={wavesurfer}
                                    />
                                ),
                            },
                        ]}
                    />
                </div>
            </Container>
        );
    }
}
