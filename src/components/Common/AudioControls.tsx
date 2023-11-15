// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';

// Cloudscape
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import Icon from '@cloudscape-design/components/icon';

// Audio
import WaveSurfer from 'wavesurfer.js';

import styles from './AudioControls.module.css';

const PLAYBACK_SPEEDS: number[] = [0.5, 1, 1.2, 1.5, 2];

type AudioControlsProps = {
    wavesurfer: React.MutableRefObject<WaveSurfer | undefined>;
    showControls: boolean;
    audioLoading: boolean;
    setShowControls: React.Dispatch<React.SetStateAction<boolean>>;
    playingAudio: boolean;
    setPlayingAudio: React.Dispatch<React.SetStateAction<boolean>>;
    playBackSpeed: number;
    setPlayBackSpeed: React.Dispatch<React.SetStateAction<number>>;
    isEmbeded?: boolean | null;
    audioBlob?: Blob | null;
};

export default function AudioControls({
    wavesurfer,
    showControls,
    audioLoading,
    setShowControls,
    playingAudio,
    setPlayingAudio,
    playBackSpeed,
    setPlayBackSpeed,
    isEmbeded = false,
    audioBlob = null,
}: AudioControlsProps) {
    const audioUrl = audioBlob ? URL.createObjectURL(audioBlob) : null;
    const buttons = (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
            }}
        >
            <Button
                onClick={(e) => {
                    e.preventDefault();
                    wavesurfer.current?.skip(-5);
                }}
            >
                <Icon name="undo" />
            </Button>
            {playingAudio ? (
                <Button
                    onClick={(e) => {
                        e.preventDefault();
                        wavesurfer.current?.pause();
                        setPlayingAudio(!playingAudio);
                    }}
                >
                    <Icon name="view-full" />
                </Button>
            ) : (
                <Button
                    onClick={(e) => {
                        e.preventDefault();
                        wavesurfer.current?.play();
                        setPlayingAudio(!playingAudio);
                    }}
                >
                    <Icon name="caret-right-filled" />
                </Button>
            )}
            <Button
                onClick={(e) => {
                    e.preventDefault();
                    const newSpeed = playBackSpeed === PLAYBACK_SPEEDS.length - 1 ? 0 : playBackSpeed + 1;
                    wavesurfer.current?.setPlaybackRate(PLAYBACK_SPEEDS[newSpeed]);
                    setPlayBackSpeed(newSpeed);
                }}
            >
                {PLAYBACK_SPEEDS[playBackSpeed]}x
            </Button>

            <Button
                onClick={(e) => {
                    e.preventDefault();
                    wavesurfer.current?.skip(5);
                }}
            >
                <Icon name="redo" />
            </Button>

            {audioUrl ? (
                <a
                    className={styles.downloadButton}
                    href={audioUrl}
                    download={'recording.' + audioBlob?.type.split(';')[0].split('/')[1]}
                >
                    <Icon name="download" />
                </a>
            ) : null}
        </div>
    );
    if (audioLoading) return;
    if (showControls) {
        return isEmbeded ? (
            <div className={styles.playerControlInline}>{buttons}</div>
        ) : (
            <div className={styles.playerControl}>
                <Container>
                    <div className={styles.closeButton}>
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                setShowControls(false);
                            }}
                            variant="icon"
                            iconName="close"
                        />
                    </div>
                    <div className={styles.ctrlHeading}>
                        <Box variant="h4">Audio Controls</Box>
                    </div>
                    {buttons}
                </Container>
            </div>
        );
    } else {
        return (
            <div className={styles.playerControl}>
                <Container>
                    <Button
                        iconName="angle-up"
                        onClick={(e) => {
                            e.preventDefault();
                            setShowControls(true);
                        }}
                    />
                </Container>
            </div>
        );
    }
}
