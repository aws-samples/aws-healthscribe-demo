// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { memo, useEffect, useRef, useState } from 'react';

// App
import { ITranscript } from '../../../types/HealthScribe';
import { PopOverComp } from './PopOverComp';

// Audio
import WaveSurfer from 'wavesurfer.js';

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

    return (
        <div ref={segmentRef} style={{ scrollMarginTop: '80px' }}>
            {script.Words.map((word, i, arr) => {
                return (
                    <PopOverComp
                        Entity={!!word.ClinicalEntity}
                        Skip={!word.Type}
                        PreviousPhraseConnection={!!arr[i - 1]?.ClinicalPhrase}
                        ForwardPhraseConnection={!!arr[i + 1]?.ClinicalPhrase}
                        KeyPhrase={!!word.ClinicalPhrase}
                        key={i}
                        BeginAudioTime={word.BeginAudioTime}
                        EndAudioTime={word.EndAudioTime}
                        audioTime={audioTime}
                        Word={word.Alternatives[0].Content}
                        Tag={script.SectionDetails.SectionName}
                        smallTalkCheck={smallTalkCheck}
                        audioReady={audioReady}
                        wavesurfer={wavesurfer}
                    />
                );
            })}
        </div>
    );
});
