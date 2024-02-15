// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { memo, useMemo } from 'react';

import * as awsui from '@cloudscape-design/design-tokens';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Popover from '@cloudscape-design/components/popover';
import SpaceBetween from '@cloudscape-design/components/space-between';

import toast from 'react-hot-toast';
import WaveSurfer from 'wavesurfer.js';

import ValueWithLabel from '@/components/Common/ValueWithLabel';
import ClinicalInsight from '@/components/Conversation/LeftPanel/ClinicalInsight';
import { IClinicalInsights, IWordAlternative } from '@/types/HealthScribe';

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
    const wordStyle = useMemo(() => {
        const style = {
            color: '',
            fontWeight: 'normal',
        };

        if (isClinicalEntity) {
            style.color = awsui.colorTextStatusInfo;
            style.fontWeight = 'bold';
        }
        if (highlightWord) style.color = awsui.colorTextStatusError;
        if (disableSegment) style.color = awsui.colorTextStatusInactive;

        return style;
    }, [highlightWord, disableSegment, isClinicalEntity]);

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
                    style={wordStyle}
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
