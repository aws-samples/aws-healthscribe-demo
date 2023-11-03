// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { useRef, useState } from 'react';

import WaveSurfer from 'wavesurfer.js';

import { HighlightId } from '@/components/Conversation/types';

export function useAudio() {
    const wavesurfer = useRef<WaveSurfer>();
    const [audioReady, setAudioReady] = useState<boolean>(false); // is wavesurfer ready with audio loaded
    const [audioTime, setAudioTime] = useState<number>(0); // Current audio time
    const [smallTalkCheck, setSmallTalkCheck] = useState<boolean>(false); // show/hide small talk
    const [highlightId, setHighlightId] = useState<HighlightId>({
        allSegmentIds: [],
        selectedSegmentId: '',
    }); // what's being highlighted

    return [
        wavesurfer,
        audioReady,
        setAudioReady,
        audioTime,
        setAudioTime,
        smallTalkCheck,
        setSmallTalkCheck,
        highlightId,
        setHighlightId,
    ] as const;
}
