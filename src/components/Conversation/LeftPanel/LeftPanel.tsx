// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { MutableRefObject, useEffect, useState } from 'react';

// Audio
import WaveSurfer from 'wavesurfer.js';

// Cloudscape
import Box from '@cloudscape-design/components/box';
import Container from '@cloudscape-design/components/container';
import Grid from '@cloudscape-design/components/grid';
import Header from '@cloudscape-design/components/header';

// App
import {
    IAuraTranscriptOutput,
    IClinicalInsights,
    ITranscript,
    ITranscriptItems,
    ITranscriptSegments,
} from '../../../types/HealthScribe';
import { HighlightId } from '../types';
import { Loading } from '../Common/Loading';
import { TranscriptSegment } from './TranscriptSegment';
import toTitleCase from '../../../utils/toTitleCase';

// Lodash
import has from 'lodash/has';
import keys from 'lodash/keys';
import keyBy from 'lodash/keyBy';
import pickBy from 'lodash/pickBy';
import slice from 'lodash/slice';
import takeWhile from 'lodash/takeWhile';
import values from 'lodash/values';

// Toast
import { toast } from 'react-hot-toast';

import styles from './LeftPanel.module.css';

const TRANSCRIPT_SPACING = '10px';

type LeftPanelProps = {
    jobLoading: boolean;
    transcriptFile: IAuraTranscriptOutput | null;
    highlightId: HighlightId;
    setHighlightId: React.Dispatch<React.SetStateAction<HighlightId>>;
    wavesurfer: MutableRefObject<WaveSurfer | undefined>;
    smallTalkCheck: boolean;
    audioTime: number;
    setAudioTime: React.Dispatch<React.SetStateAction<number>>;
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
    const [multiSpeakers, setMultiSpeakers] = useState<boolean>(false); // whether there are multiple speakers
    const [transcript, setTranscript] = useState<ITranscript[]>([]); // transcript (and useless comment)

    useEffect(() => {
        if (jobLoading || transcriptFile == null) return;

        setMultiSpeakers(false);

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
    // If the current audio time is outside of this part, then reset the highlight
    // The highlight comes from ClinicalConcepts ("Summarizations") from the right panel
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
                        continue;
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
        return (
            <Container header={<Header variant="h2">Transcript</Header>}>
                <Loading loading={jobLoading} text="Loading Transcript" />
            </Container>
        );
    } else {
        return (
            <Container header={<Header variant="h2">Transcript</Header>}>
                <div className={styles.transcript}>
                    {transcript.map((script, key) => {
                        const newSpeaker =
                            script.ParticipantDetails.ParticipantRole !==
                            transcript[key - 1]?.ParticipantDetails.ParticipantRole;
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
                                        style={{ paddingTop: newSpeaker && key > 0 ? TRANSCRIPT_SPACING : '' }}
                                        className={
                                            ['OTHER', 'SMALL_TALK'].includes(script.SectionDetails.SectionName) &&
                                            smallTalkCheck
                                                ? styles.disabled
                                                : ''
                                        }
                                    >
                                        <Box fontSize="heading-s" variant="strong">
                                            {newSpeaker && (
                                                <div className={`${styles.row} ${styles.hidescrollbar}`}>
                                                    {toTitleCase(
                                                        script.ParticipantDetails.ParticipantRole.split('_')[0]
                                                    )}
                                                    {multiSpeakers &&
                                                        ` ${
                                                            +script.ParticipantDetails.ParticipantRole.split('_')[1] + 1
                                                        }`}
                                                </div>
                                            )}
                                        </Box>
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
                </div>
            </Container>
        );
    }
}
