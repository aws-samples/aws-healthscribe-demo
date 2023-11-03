// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';

import WaveSurfer from 'wavesurfer.js';

import { ITranscript } from '@/types/HealthScribe';

import { WordPopoverMemo } from './WordPopover';

interface TranscriptSegmentProps {
    script: ITranscript;
    smallTalkCheck: boolean;
    audioTime: number;
    audioReady: boolean;
    wavesurfer: React.MutableRefObject<WaveSurfer | undefined>;
}

export const TranscriptSegment = memo(function TranscriptSegment({
    script,
    smallTalkCheck,
    audioTime,
    audioReady,
    wavesurfer,
}: TranscriptSegmentProps) {
    const segmentRef = useRef<HTMLDivElement>(null);
    const [triggerKey, setTriggerKey] = useState(false);

    const executeScroll = () => {
        (segmentRef.current as HTMLDivElement).scrollIntoView({
            behavior: 'smooth',
            // jump to start when audio isn't playing. otherwise, jump to nearest
            block: wavesurfer.current?.isPlaying() ? 'nearest' : 'start',
            inline: 'center',
        });
        setTriggerKey(true);
    };

    useEffect(() => {
        if (audioTime >= script.BeginAudioTime && audioTime <= script.EndAudioTime && !triggerKey) {
            executeScroll();
        } else if ((audioTime < script.BeginAudioTime || audioTime > script.EndAudioTime) && triggerKey) {
            setTriggerKey(false);
        }
        // eslint-disable-next-line
    }, [audioTime]);

    const disableSegment = useMemo(() => {
        return ['OTHER', 'SMALL_TALK'].includes(script.SectionDetails.SectionName) && smallTalkCheck;
    }, [script.SectionDetails.SectionName, smallTalkCheck]);

    const audioDuration = useMemo(() => {
        if (audioReady) {
            return wavesurfer.current?.getDuration() || -1;
        } else {
            return -1;
        }
    }, [audioReady]);

    return (
        <div ref={segmentRef} style={{ scrollMarginTop: '80px' }}>
            {script.Words.map((word, i) => {
                // punctuation (.,?, etc.) the same BeingAudioTime and EndAudioTime
                const isPunctuation = word.BeginAudioTime === word.EndAudioTime;
                // highlight the word if the current audio time is between where the word time starts and ends
                const highlightWord =
                    audioTime > word.BeginAudioTime && audioTime < word.EndAudioTime && !isPunctuation;
                // highlight the word as a clinical entity if word.ClinicalEntity and word.Type exist
                const isClinicalEntity = !!word.ClinicalEntity && !!word.Type;
                return (
                    <WordPopoverMemo
                        key={i}
                        isPunctuation={isPunctuation}
                        highlightWord={highlightWord}
                        disableSegment={disableSegment}
                        isClinicalEntity={isClinicalEntity}
                        wordBeginAudioTime={word.BeginAudioTime}
                        audioDuration={audioDuration}
                        word={word.Alternatives[0]}
                        wordClinicalEntity={word.ClinicalEntity}
                        audioReady={audioReady}
                        wavesurfer={wavesurfer}
                    />
                );
            })}
        </div>
    );
});
