// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import { Dispatch, MutableRefObject, SetStateAction, useEffect, useState } from 'react';

import Grid from '@cloudscape-design/components/grid';

import has from 'lodash/has';
import keyBy from 'lodash/keyBy';
import keys from 'lodash/keys';
import pickBy from 'lodash/pickBy';
import slice from 'lodash/slice';
import takeWhile from 'lodash/takeWhile';
import values from 'lodash/values';
import { toast } from 'react-hot-toast';
import WaveSurfer from 'wavesurfer.js';

import LoadingContainer from '@/components/Conversation/Common/LoadingContainer';
import ScrollingContainer from '@/components/Conversation/Common/ScrollingContainer';
import {
    IAuraTranscriptOutput,
    IClinicalInsights,
    ITranscript,
    ITranscriptItems,
    ITranscriptSegments,
} from '@/types/HealthScribe';
import toTitleCase from '@/utils/toTitleCase';

import { HighlightId } from '../types';
import styles from './LeftPanel.module.css';
import { TranscriptSegment } from './TranscriptSegment';

const TRANSCRIPT_SPACING = '10px';

type LeftPanelProps = {
    jobLoading: boolean;
    transcriptFile: IAuraTranscriptOutput | null;
    highlightId: HighlightId;
    setHighlightId: Dispatch<SetStateAction<HighlightId>>;
    wavesurfer: MutableRefObject<WaveSurfer | undefined>;
    smallTalkCheck: boolean;
    audioTime: number;
    setAudioTime: Dispatch<SetStateAction<number>>;
    audioReady: boolean;
};

export default function LeftPanel({
    jobLoading,
    transcriptFile,
    highlightId,
    setHighlightId,
    wavesurfer,
    smallTalkCheck,
    audioTime,
    setAudioTime,
    audioReady,
}: LeftPanelProps) {
    const [multiSpeakers, setMultiSpeakers] = useState<string[]>([]); // whether there are multiple speakers
    const [transcript, setTranscript] = useState<ITranscript[]>([]); // transcript (and useless comment)

    useEffect(() => {
        if (jobLoading || transcriptFile == null) return;

        setMultiSpeakers([]);

        const transcriptItems: ITranscriptItems[] = transcriptFile!.Conversation?.TranscriptItems;
        const transcriptSegments: ITranscriptSegments[] = transcriptFile!.Conversation?.TranscriptSegments;
        const transcriptInsights: IClinicalInsights[] = transcriptFile.Conversation?.ClinicalInsights;

        let words = transcriptItems;
        const transcriptMod = [];

        // Iterate through transcriptSegments, pull words until EndAudioTime is reached for the first time
        for (const segment of transcriptSegments) {
            const wordArray = takeWhile(words, (val) => {
                return val.EndAudioTime <= segment.EndAudioTime;
            });
            transcriptMod.push({ ...segment, Words: wordArray });
            words = slice(words, wordArray.length);
        }

        const segmentDict = keyBy(transcriptMod, 'SegmentId');

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
                const dIndexes = keys(
                    pickBy(segmentDict[span.SegmentId].Words, ({ Alternatives }) => {
                        const copyIndex = currentStartIndex;

                        if (Alternatives[0].Content.length === 1 && !/^[a-zA-Z]+$/.test(Alternatives[0].Content[0])) {
                            currentStartIndex += Alternatives[0].Content.length;
                        } else {
                            currentStartIndex += Alternatives[0].Content.length + 1;
                        }

                        return span.BeginCharacterOffset <= copyIndex && span.EndCharacterOffset >= copyIndex;
                    })
                );
                // update insightRef with insightId: beginAudioTime for each insight
                // update the relevant segmentDict word array with the insight
                for (const detected of dIndexes) {
                    const index = parseInt(detected);

                    if (index !== -1) {
                        switch (insight.InsightType) {
                            case 'ClinicalEntity': {
                                segmentDict[span.SegmentId].Words[index].ClinicalEntity = insight;

                                if (
                                    !has(insightRef, segmentDict[span.SegmentId].Words[index].ClinicalEntity.InsightId)
                                ) {
                                    insightRef[segmentDict[span.SegmentId].Words[index].ClinicalEntity.InsightId] =
                                        segmentDict[span.SegmentId].Words[index].BeginAudioTime;
                                }
                                break;
                            }
                            case 'ClinicalPhrase': {
                                segmentDict[span.SegmentId].Words[index].ClinicalPhrase = insight;

                                if (
                                    !has(insightRef, segmentDict[span.SegmentId].Words[index].ClinicalPhrase.InsightId)
                                ) {
                                    insightRef[segmentDict[span.SegmentId].Words[index].ClinicalPhrase.InsightId] =
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

        setTranscript(values(segmentDict));
    }, [jobLoading, transcriptFile]);

    // Extract the part of the transcript to highlight
    // If the current audio time is outside of this part, then reset the highlight, which comes from ClinicalConcepts ("Summarizations") from the right panel
    const currentAudioTime = wavesurfer.current?.getCurrentTime() || 0;
    useEffect(() => {
        function resetHighlightId() {
            setHighlightId({
                allSegmentIds: [],
                selectedSegmentId: '',
            });
        }
        // Reset highlightID - no segements will be highlighted
        if (highlightId.selectedSegmentId) {
            const transcriptHighlightAll = transcript
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

            const startHighlightTime = transcriptHighlightAll[transcriptHighlightSelectedInd].BeginAudioTime;
            let endHighlightTime = transcriptHighlightAll[transcriptHighlightSelectedInd].EndAudioTime;
            if (transcriptHighlightSelectedInd >= 0) {
                for (let i = transcriptHighlightSelectedInd + 1; i < transcriptHighlightAll.length; i++) {
                    if (
                        Math.abs(
                            Math.floor(transcriptHighlightAll[i - 1].EndAudioTime * 100) -
                                Math.floor(transcriptHighlightAll[i].BeginAudioTime * 100)
                        ) < 3
                    ) {
                        endHighlightTime = transcriptHighlightAll[i].EndAudioTime;
                    } else {
                        break;
                    }
                }
            } else {
                resetHighlightId();
            }

            if (audioReady && (currentAudioTime < startHighlightTime || currentAudioTime > endHighlightTime)) {
                resetHighlightId();
            }
        }
    }, [highlightId, transcript, currentAudioTime, audioReady, setAudioTime]);

    if (jobLoading || transcriptFile == null) {
        return <LoadingContainer containerTitle="Transcript" text="Loading Transcript" />;
    } else {
        return (
            <ScrollingContainer containerTitle="Transcript">
                {transcript.map((script, key) => {
                    const newSpeaker =
                        script.ParticipantDetails.ParticipantRole !==
                        transcript[key - 1]?.ParticipantDetails.ParticipantRole;
                    const speakerName = script.ParticipantDetails.ParticipantRole.split('_')[0];
                    const speakerNameFormatted = multiSpeakers.includes(speakerName)
                        ? `${toTitleCase(speakerName)} ${
                              parseInt(script.ParticipantDetails.ParticipantRole.split('_')[1]) + 1
                          }`
                        : toTitleCase(speakerName);
                    // Highlight both the same for uniformity highlightLight/highlightMedium
                    const highlightSegmentStyle =
                        script.SegmentId === highlightId.selectedSegmentId
                            ? styles.highlightMedium
                            : highlightId.allSegmentIds.includes(script.SegmentId)
                              ? styles.highlightMedium
                              : '';
                    return (
                        <div key={key} style={{ paddingTop: !key ? '15px' : '' }}>
                            <Grid disableGutters gridDefinition={[{ colspan: 2 }, { colspan: 10 }]}>
                                <div
                                    style={{
                                        paddingTop: newSpeaker && key > 0 ? TRANSCRIPT_SPACING : '',
                                        fontWeight: 'bold',
                                        fontSize: multiSpeakers ? '14px' : '16px',
                                    }}
                                    className={
                                        ['OTHER', 'SMALL_TALK'].includes(script.SectionDetails.SectionName) &&
                                        smallTalkCheck
                                            ? styles.disabled
                                            : ''
                                    }
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
                                    }}
                                    className={highlightSegmentStyle}
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
