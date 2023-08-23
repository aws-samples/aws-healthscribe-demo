// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

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
    setShowControls: React.Dispatch<React.SetStateAction<boolean>>;
    playingAudio: boolean;
    setPlayingAudio: React.Dispatch<React.SetStateAction<boolean>>;
    playBackSpeed: number;
    setPlayBackSpeed: React.Dispatch<React.SetStateAction<number>>;
};

export default function AudioControls({
    wavesurfer,
    showControls,
    setShowControls,
    playingAudio,
    setPlayingAudio,
    playBackSpeed,
    setPlayBackSpeed,
}: AudioControlsProps) {
    if (showControls) {
        return (
            <div className={styles.playerControl}>
                <Container>
                    <div className={styles.closeButton}>
                        <Button
                            onClick={() => {
                                setShowControls(false);
                            }}
                            variant="icon"
                            iconName="close"
                        />
                    </div>
                    <div className={styles.ctrlHeading}>
                        <Box variant="h4">Audio Controls</Box>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                        }}
                    >
                        <Button onClick={() => wavesurfer.current?.skip(-5)}>
                            <Icon name="undo" />
                        </Button>
                        {playingAudio ? (
                            <Button
                                onClick={() => {
                                    wavesurfer.current?.pause();
                                    setPlayingAudio(!!wavesurfer.current?.isPlaying());
                                }}
                            >
                                <Icon name="view-full" />
                            </Button>
                        ) : (
                            <Button
                                onClick={() => {
                                    wavesurfer.current?.play();
                                    setPlayingAudio(!!wavesurfer.current?.isPlaying());
                                }}
                            >
                                <Icon name="caret-right-filled" />
                            </Button>
                        )}
                        <Button
                            onClick={() => {
                                const newSpeed = playBackSpeed === PLAYBACK_SPEEDS.length - 1 ? 0 : playBackSpeed + 1;
                                wavesurfer.current?.setPlaybackRate(PLAYBACK_SPEEDS[newSpeed]);
                                setPlayBackSpeed(newSpeed);
                            }}
                        >
                            {PLAYBACK_SPEEDS[playBackSpeed]}x
                        </Button>

                        <Button onClick={() => wavesurfer.current?.skip(5)}>
                            <Icon name="redo" />
                        </Button>
                    </div>
                </Container>
            </div>
        );
    } else {
        return (
            <div className={styles.playerControl}>
                <Container>
                    <Button
                        iconName="angle-up"
                        onClick={() => {
                            setShowControls(true);
                        }}
                    />
                </Container>
            </div>
        );
    }
}
