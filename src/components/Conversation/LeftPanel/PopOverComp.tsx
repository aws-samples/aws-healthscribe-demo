// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// Cloudscape
import Button from '@cloudscape-design/components/button';
import Popover from '@cloudscape-design/components/popover';
import SpaceBetween from '@cloudscape-design/components/space-between';

// Audio
import WaveSurfer from 'wavesurfer.js';

// Toast
import toast from 'react-hot-toast';

import styles from './PopOverComp.module.css';

type PopOverCompProps = {
    Entity: boolean;
    Skip: boolean;
    PreviousPhraseConnection: boolean;
    ForwardPhraseConnection: boolean;
    KeyPhrase: boolean;
    BeginAudioTime: number;
    EndAudioTime: number;
    audioTime: number;
    Word: string;
    Tag: string;
    smallTalkCheck: boolean;
    audioReady: boolean;
    wavesurfer: React.MutableRefObject<WaveSurfer | undefined>;
};

export function PopOverComp({
    Entity,
    Skip,
    PreviousPhraseConnection,
    ForwardPhraseConnection,
    KeyPhrase,
    BeginAudioTime,
    EndAudioTime,
    audioTime,
    Word,
    Tag,
    smallTalkCheck,
    audioReady,
    wavesurfer,
}: PopOverCompProps) {
    return (
        <>
            {BeginAudioTime !== EndAudioTime && (
                <span
                    style={{
                        textDecoration:
                            PreviousPhraseConnection && ForwardPhraseConnection ? '0.1rem underline red' : '',
                    }}
                >
                    {' '}
                </span>
            )}
            <Popover
                dismissButton={false}
                position="top"
                size="large"
                triggerType="custom"
                content={
                    <SpaceBetween size="xs" direction="horizontal">
                        <Button
                            disabled={!audioReady}
                            onClick={() => {
                                wavesurfer.current?.seekTo(BeginAudioTime / wavesurfer.current?.getDuration());
                                toast.success(`Seeked to: ${BeginAudioTime} seconds`);
                            }}
                        >
                            Jump to
                        </Button>
                    </SpaceBetween>
                }
            >
                <span
                    className={`${
                        audioTime >= BeginAudioTime &&
                        audioTime < EndAudioTime &&
                        BeginAudioTime !== EndAudioTime &&
                        wavesurfer.current?.isPlaying()
                            ? styles.highlight
                            : ''
                    } ${['OTHER', 'SMALL_TALK'].includes(Tag) && smallTalkCheck ? styles.disabled : ''}`}
                    onCopy={() => {
                        toast.success('Copied Text!');
                    }}
                    style={{
                        fontWeight: (Entity && !Skip) || (KeyPhrase && !Skip) ? 'bolder' : '',
                        color: (Entity && !Skip) || (KeyPhrase && !Skip) ? 'blue' : '',
                    }}
                >
                    {Word}
                </span>
            </Popover>
        </>
    );
}
