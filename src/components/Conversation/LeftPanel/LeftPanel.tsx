// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { RefObject } from 'react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import * as awsui from '@cloudscape-design/design-tokens';
import Grid from '@cloudscape-design/components/grid';

import { toast } from 'react-hot-toast';
import WaveSurfer from 'wavesurfer.js';

import LoadingContainer from '@/components/Conversation/Common/LoadingContainer';
import ScrollingContainer from '@/components/Conversation/Common/ScrollingContainer';
import {
    IClinicalInsight,
    IHealthScribeTranscript,
    IProcessedItem,
    IProcessedTranscript,
    ITranscriptItem,
    ITranscriptSegment,
} from '@/types/HealthScribeTranscript';
import toTitleCase from '@/utils/toTitleCase';

import { HighlightId } from '../types';
import styles from './LeftPanel.module.css';
import { TranscriptSegment } from './TranscriptSegment';

const TRANSCRIPT_SPACING = '10px';

type LeftPanelProps = {
    jobLoading: boolean;
    transcript: IHealthScribeTranscript | undefined;
    highlightId: HighlightId;
    setHighlightId: Dispatch<SetStateAction<HighlightId>>;
    wavesurfer: RefObject<WaveSurfer | undefined>;
    smallTalkCheck: boolean;
    audioTime: number;
    setAudioTime: Dispatch<SetStateAction<number>>;
    audioReady: boolean;
};

export default function LeftPanel({
    jobLoading,
    transcript,
    highlightId,
    setHighlightId,
    wavesurfer,
    smallTalkCheck,
    audioTime,
    setAudioTime,
    audioReady,
}: LeftPanelProps) {
    const [multiSpeakers, setMultiSpeakers] = useState<string[]>([]); // whether there are multiple speakers
    const [processedTranscript, setProcessedTranscript] = useState<IProcessedTranscript[]>([]); // transcript (and useless comment)

    useEffect(() => {
        if (jobLoading || transcript == null) return;

        setMultiSpeakers([]);

        const transcriptInsights: IClinicalInsight[] = transcript!.Conversation?.ClinicalInsights;
        const transcriptSegments: ITranscriptSegment[] = transcript!.Conversation?.TranscriptSegments;
        const transcriptItems: ITranscriptItem[] = transcript!.Conversation?.TranscriptItems;

        let words: IProcessedItem[] = transcriptItems;
        const transcriptMod = [];

        // Iterate through transcriptSegments, pull words until EndAudioTime is reached for the first time
        for (const segment of transcriptSegments) {
            const endIndex = words.findIndex((val) => val.EndAudioTime > segment.EndAudioTime);
            const wordArray = endIndex === -1 ? words : words.slice(0, endIndex);
            transcriptMod.push({ ...segment, Words: wordArray });
            words = words.slice(wordArray.length);
        }

        // Create a dictionary of segments indexed by SegmentId
        const segmentDict = transcriptMod.reduce(
            (acc, segment) => {
                acc[segment.SegmentId] = segment;
                return acc;
            },
            {} as { [key: string]: (typeof transcriptMod)[0] }
        );

        // Determine if there's multiple speakers (>2)
        const transcriptSpeakers = [...new Set(transcriptSegments.map((s) => s.ParticipantDetails.ParticipantRole))];
        if (transcriptSpeakers.length > 2) {
            const speakerList = [...new Set(transcriptSpeakers.map((s) => s.split('_')[0]))];
            const speakerCount = speakerList.map((sl) => {
                return { speaker: sl, count: transcriptSpeakers.filter((ts) => ts.split('_')[0] === sl).length };
            });
            const transcriptMultiSpeakers = speakerCount.filter((sc) => sc.count > 1).map((sc) => sc.speaker);
            if (transcriptMultiSpeakers.length > 0) {
                setMultiSpeakers(transcriptMultiSpeakers);
            }
        }

        // Iterate through transcript insights, and update segmentDict with the relevant insight.
        // This is used for highlighting the transcript
        const insightRef: { [key: string]: number } = {};
        for (const insight of transcriptInsights) {
            for (const span of insight.Spans) {
                let currentStartIndex = 0;
                // build a segmentDic index of word positions (string[]) for each insight
                // TODO: In the streaming result, alternatives does not exist
                const filteredWords = Object.entries(segmentDict[span.SegmentId].Words).filter(
                    ([, { Alternatives }]) => {
                        const copyIndex = currentStartIndex;

                        if (
                            typeof Alternatives !== 'undefined' &&
                            Alternatives.length > 0 &&
                            Alternatives[0].Content?.length === 1 &&
                            !/^[a-zA-Z]+$/.test(Alternatives[0].Content[0])
                        ) {
                            currentStartIndex += Alternatives[0].Content.length;
                        } else {
                            currentStartIndex += (Alternatives?.[0].Content || '0').length + 1;
                        }

                        return span.BeginCharacterOffset <= copyIndex && span.EndCharacterOffset >= copyIndex;
                    }
                );
                const dIndexes = filteredWords.map(([index]) => index);

                // update insightRef with insightId: beginAudioTime for each insight
                // update the relevant segmentDict word array with the insight
                for (const detected of dIndexes) {
                    const index = parseInt(detected);

                    if (index !== -1) {
                        switch (insight.InsightType) {
                            case 'ClinicalEntity': {
                                segmentDict[span.SegmentId].Words[index].ClinicalEntity = insight;

                                if (!(insight.InsightId in insightRef)) {
                                    insightRef[insight.InsightId] =
                                        segmentDict[span.SegmentId].Words[index].BeginAudioTime;
                                }
                                break;
                            }
                            default:
                                break;
                        }
                    } else {
                        toast.error(`Insight missed: ${insight}`);
                    }
                }
            }
        }

        setProcessedTranscript(Object.values(segmentDict));
    }, [jobLoading, transcript]);

    // Extract the part of the transcript to highlight
    useEffect(() => {
        function resetHighlightId() {
            setHighlightId({
                allSegmentIds: [],
                selectedSegmentId: '',
            });
        }

        // Reset highlightID - no segements will be highlighted
        if (highlightId.selectedSegmentId) {
            const transcriptHighlightAll = processedTranscript
                .filter((t) => highlightId.allSegmentIds.includes(t.SegmentId))
                ?.map((h) => {
                    return { SegmentId: h.SegmentId, BeginAudioTime: h.BeginAudioTime, EndAudioTime: h.EndAudioTime };
                });

            if (transcriptHighlightAll.length === 0) {
                resetHighlightId();
                return;
            }

            const transcriptHighlightSelectedInd = transcriptHighlightAll.findIndex(
                (t) => t.SegmentId === highlightId.selectedSegmentId
            );

            // if wavesurfer hasn't loaded yet, manually set audio time to trigger scroll
            if (!audioReady && transcriptHighlightSelectedInd >= 0) {
                setAudioTime(transcriptHighlightAll[transcriptHighlightSelectedInd].BeginAudioTime);
            }
        }
    }, [highlightId, transcript, audioReady, setAudioTime]);

    if (jobLoading || transcript == null) {
        return <LoadingContainer containerTitle="Transcript" text="Loading Transcript" />;
    } else {
        return (
            <ScrollingContainer containerTitle="Transcript">
                {processedTranscript.map((script, key) => {
                    const newSpeaker =
                        script.ParticipantDetails.ParticipantRole !==
                        processedTranscript[key - 1]?.ParticipantDetails.ParticipantRole;
                    const speakerName = script.ParticipantDetails.ParticipantRole.split('_')[0];
                    const speakerNameFormatted = multiSpeakers.includes(speakerName)
                        ? `${toTitleCase(speakerName)} ${
                              parseInt(script.ParticipantDetails.ParticipantRole.split('_')[1]) + 1
                          }`
                        : toTitleCase(speakerName);
                    // Highlight both the same for uniformity highlightLight/highlightMedium
                    const highlightSegmentBackgroundColor =
                        script.SegmentId === highlightId.selectedSegmentId
                            ? awsui.colorBackgroundToggleCheckedDisabled
                            : highlightId.allSegmentIds.includes(script.SegmentId)
                              ? awsui.colorBackgroundToggleCheckedDisabled
                              : '';
                    return (
                        <div key={key} style={{ paddingTop: !key ? '15px' : '' }}>
                            <Grid disableGutters gridDefinition={[{ colspan: 2 }, { colspan: 10 }]}>
                                <div
                                    style={{
                                        paddingTop: newSpeaker && key > 0 ? TRANSCRIPT_SPACING : '',
                                        fontWeight: 'bold',
                                        fontSize: multiSpeakers ? '14px' : '16px',
                                        ...{
                                            color:
                                                ['OTHER', 'SMALL_TALK'].includes(script.SectionDetails.SectionName) &&
                                                smallTalkCheck
                                                    ? awsui.colorTextStatusInactive
                                                    : '',
                                        },
                                    }}
                                >
                                    {newSpeaker && (
                                        <div className={`${styles.row} ${styles.hidescrollbar}`}>
                                            {speakerNameFormatted}
                                        </div>
                                    )}
                                </div>
                                <div
                                    style={{
                                        paddingTop: newSpeaker && key > 0 ? TRANSCRIPT_SPACING : '',
                                        backgroundColor: highlightSegmentBackgroundColor,
                                    }}
                                >
                                    <TranscriptSegment
                                        script={script}
                                        smallTalkCheck={smallTalkCheck}
                                        audioTime={audioTime}
                                        audioReady={audioReady}
                                        wavesurfer={wavesurfer}
                                    />
                                </div>
                            </Grid>
                        </div>
                    );
                })}
            </ScrollingContainer>
        );
    }
}
