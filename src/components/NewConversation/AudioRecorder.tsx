// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useEffect, useRef, useState } from 'react';

import Button from '@cloudscape-design/components/button';
import Grid from '@cloudscape-design/components/grid';
import Icon from '@cloudscape-design/components/icon';

import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record';

import AudioControls from '../Common/AudioControls';
import styles from './AudioRecorder.module.css';

type AudioRecorderProps = {
    setRecordedAudio: React.Dispatch<React.SetStateAction<File | undefined>>;
};

interface Recording {
    duration: string;
    index: number;
}

export default function AudioRecorder({ setRecordedAudio }: AudioRecorderProps) {
    const wavesurfer = useRef<WaveSurfer | undefined>(undefined);
    const wavesurfermic = useRef<WaveSurfer | undefined>(undefined);
    const wavesurferRecordPlugin = useRef<RecordPlugin | undefined>(undefined);
    const [recordingStatus, setRecordingStatus] = useState('inactive');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [showControls, setShowControls] = useState<boolean>(false); // show/hide audio controls
    const [playingAudio, setPlayingAudio] = useState<boolean>(false); // is audio playing
    const [playBackSpeed, setPlayBackSpeed] = useState<number>(1); // playback speed
    const waveformElement = document.getElementById('waveformForRecording'); // wavesurfer.js wrapper element
    const [audioLoading, setAudioLoading] = useState<boolean>(true); // is audio file loading
    const [stopWatchTime, setStopWatchTime] = useState(0);
    const stopWatchHours: number = Math.floor(stopWatchTime / 360000);
    const stopWatchMinutes = Math.floor((stopWatchTime % 360000) / 6000);
    const stopWatchSeconds = Math.floor((stopWatchTime % 6000) / 100);
    const [lastRecordingDetails, setLastRecordingDetails] = useState<Recording | null>(null);
    const showDownloadButton = true;

    useEffect(() => {
        if (!wavesurfermic || !wavesurfermic.current) {
            wavesurfermic.current = WaveSurfer.create({
                container: '#wavesurfermic',
                waveColor: 'rgb(9, 114, 211)',
                progressColor: 'rgb(232, 232, 232)',
                height: 40,
            });
            wavesurferRecordPlugin.current = wavesurfermic.current?.registerPlugin(RecordPlugin.create());
        }
    }, []);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | string | number | undefined;
        if (recordingStatus == 'recording') {
            intervalId = setInterval(() => setStopWatchTime(stopWatchTime + 1), 10);
        } else if (recordingStatus == 'recorded') {
            setStopWatchTime(0);
        }
        return () => clearInterval(intervalId);
    }, [recordingStatus, stopWatchTime]);

    const startRecording = () => {
        setRecordingStatus('recording');
        wavesurferRecordPlugin.current?.startRecording();
        setShowControls(false);
    };

    const stopRecording = () => {
        setRecordingStatus('recorded');

        wavesurferRecordPlugin.current?.stopRecording();
        wavesurferRecordPlugin.current?.on('record-end', (blob) => {
            const audioUrl = URL.createObjectURL(blob);
            setRecordedAudio(new File([blob], 'recorded.mp3'));
            setAudioUrl(audioUrl);
            setAudioBlob(blob);
            loadWaveSurfer(audioUrl);
            setLastRecordingDetails({
                index: lastRecordingDetails === null ? 1 : lastRecordingDetails.index + 1,
                duration:
                    stopWatchHours.toString().padStart(2, '0') +
                    ':' +
                    stopWatchMinutes.toString().padStart(2, '0') +
                    ':' +
                    stopWatchSeconds.toString().padStart(2, '0'),
            });
        });
    };

    const restartRecording = () => {
        setRecordedAudio(undefined);
        setAudioUrl(null);
        setAudioLoading(true);
        setShowControls(false);
        setRecordingStatus('inactive');
        startRecording();
    };

    const loadWaveSurfer = (audioUrl: string, reset: boolean = false) => {
        if (reset || !wavesurfer || !wavesurfer.current) {
            wavesurfer.current = WaveSurfer.create({
                container: waveformElement || '#waveformForRecording',
                height: 40,
                normalize: false,
                waveColor: 'rgba(35, 47, 62, 0.8)',
                progressColor: '#2074d5',
                url: audioUrl,
            });
        } else {
            wavesurfer.current.load(audioUrl);
        }
        wavesurfer.current.on('ready', () => {
            setAudioLoading(false);
            setShowControls(true);
        });

        wavesurfer.current?.on('finish', () => {
            setPlayingAudio(!!wavesurfer.current?.isPlaying());
        });
    };

    return (
        <div className={styles.audioRecorderContainer}>
            <div className={styles.audioRecorderTopPanel}>
                <Grid gridDefinition={[{ colspan: { default: 1, xxs: 1 } }, { colspan: { default: 11, xxs: 11 } }]}>
                    <div className={styles.audioRecorderSpeaker}>
                        <img className={styles.audioRecorderSpeakerIcon} src="/record.png" alt={'Record Icon'} />
                    </div>
                    <div>
                        <span className={styles.audioRecorderSpeakerText}>
                            {recordingStatus === 'inactive' ? 'Click "Start" when you are ready to record' : null}
                            {recordingStatus === 'recorded' ? 'Click "Restart" to record a new session' : null}
                            {recordingStatus === 'recording' ? 'Click "Stop" to stop the recording' : null}
                        </span>
                        <div
                            id="wavesurfermic"
                            className={
                                recordingStatus === 'inactive' || recordingStatus === 'recorded'
                                    ? styles.audioWavesurferInitialState
                                    : styles.audioWavesurferLoadedState
                            }
                        />
                        <div className={styles.audioRecorderRecordingControls}>
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (recordingStatus === 'inactive') startRecording();
                                    else if (recordingStatus === 'recording') stopRecording();
                                    else if (recordingStatus === 'pauseRecording') stopRecording();
                                    else if (recordingStatus === 'recorded') restartRecording();
                                }}
                            >
                                {recordingStatus === 'inactive' ? (
                                    <span>
                                        <Icon name="caret-right-filled"></Icon> Start
                                    </span>
                                ) : recordingStatus === 'recording' ? (
                                    <span className={styles.audioRecorderIcon}>
                                        <Icon name="close"></Icon> Stop
                                    </span>
                                ) : (
                                    <span className={styles.audioRecorderIcon}>
                                        <Icon name="redo"></Icon> Restart
                                    </span>
                                )}
                            </Button>
                            {recordingStatus === 'recording' ? (
                                <div className={styles.audioRecorderStopWatch}>
                                    <span>
                                        {stopWatchHours.toString().padStart(2, '0')}:
                                        {stopWatchMinutes.toString().padStart(2, '0')}:
                                        {stopWatchSeconds.toString().padStart(2, '0')}
                                    </span>
                                </div>
                            ) : (
                                ''
                            )}
                        </div>
                    </div>
                </Grid>
            </div>
            <div className={!audioUrl ? '' : styles.recordingItem} style={{ height: !audioUrl ? 0 : '' }}>
                {recordingStatus === 'recorded' ? (
                    <div className={styles.recordingItemHeader}>
                        <div>Recording {lastRecordingDetails?.index}</div>
                        <div>{lastRecordingDetails?.duration}</div>
                    </div>
                ) : null}
                <div
                    id="waveformForRecording"
                    style={{
                        marginTop: '5px',
                        height: !audioUrl ? 0 : '',
                        display: !audioUrl ? 'table' : 'block',
                    }}
                />
                <AudioControls
                    wavesurfer={wavesurfer}
                    audioLoading={audioLoading}
                    showControls={showControls}
                    setShowControls={setShowControls}
                    playingAudio={playingAudio}
                    setPlayingAudio={setPlayingAudio}
                    playBackSpeed={playBackSpeed}
                    setPlayBackSpeed={setPlayBackSpeed}
                    audioBlob={audioBlob}
                    isEmbeded={true}
                />
            </div>
        </div>
    );
}
