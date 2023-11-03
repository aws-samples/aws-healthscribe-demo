// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { memo, useMemo } from 'react';

import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Popover from '@cloudscape-design/components/popover';
import SpaceBetween from '@cloudscape-design/components/space-between';

import toast from 'react-hot-toast';
import WaveSurfer from 'wavesurfer.js';

import ValueWithLabel from '@/components/Common/ValueWithLabel';
import ClinicalInsight from '@/components/Conversation/LeftPanel/ClinicalInsight';
import { IClinicalInsights, IWordAlternative } from '@/types/HealthScribe';

import styles from './WordPopover.module.css';

type PopOverCompProps = {
    isPunctuation: boolean;
    highlightWord: boolean;
    disableSegment: boolean;
    isClinicalEntity: boolean;
    wordBeginAudioTime: number;
    audioDuration: number;
    word: IWordAlternative;
    wordClinicalEntity: IClinicalInsights | object;
    audioReady: boolean;
    wavesurfer: React.MutableRefObject<WaveSurfer | undefined>;
};

function WordPopover({
    isPunctuation,
    highlightWord,
    disableSegment,
    isClinicalEntity,
    wordBeginAudioTime,
    audioDuration,
    word,
    wordClinicalEntity,
    audioReady,
    wavesurfer,
}: PopOverCompProps) {
    const popoverHighlightClass = useMemo(() => {
        return highlightWord ? styles.highlight : '';
    }, [highlightWord]);

    // disable the word if the word is tagged with small talk and smalltalk is selected
    const popoverDisableClass = useMemo(() => {
        return disableSegment ? styles.disabled : '';
    }, [disableSegment]);

    // highlight the word if it contains a clinical entity
    const popoverClinicalEntityClass = useMemo(() => {
        return isClinicalEntity ? styles.clinicalEntity : '';
    }, [isClinicalEntity]);

    const wordConfidence = useMemo(() => {
        if (typeof word.Confidence === 'number') {
            if (word.Confidence === 0) return 'n/a';
            return Math.round(word.Confidence * 100 * 100) / 100 + '%';
        } else {
            return 'n/a';
        }
    }, [word.Confidence]);

    return (
        <>
            {!isPunctuation && <span> </span>}
            <Popover
                dismissButton={false}
                position="right"
                size="large"
                triggerType="custom"
                content={
                    <SpaceBetween size="xs" direction="vertical">
                        <ValueWithLabel label={'Confidence'}>{wordConfidence}</ValueWithLabel>
                        <ClinicalInsight wordClinicalEntity={wordClinicalEntity} />
                        <Box textAlign={'center'}>
                            <Button
                                disabled={!audioReady}
                                onClick={() => {
                                    wavesurfer.current?.seekTo(
                                        audioDuration === -1 ? 0 : wordBeginAudioTime / audioDuration + 0.001
                                    );
                                    toast.success(`Seeked to: ${wordBeginAudioTime} seconds`);
                                }}
                            >
                                Jump to
                            </Button>
                        </Box>
                    </SpaceBetween>
                }
            >
                <span
                    className={`${popoverHighlightClass} ${popoverDisableClass} ${popoverClinicalEntityClass}`}
                    onCopy={() => {
                        toast.success('Copied Text!');
                    }}
                >
                    {word.Content}
                </span>
            </Popover>
        </>
    );
}

export const WordPopoverMemo = memo(WordPopover);
