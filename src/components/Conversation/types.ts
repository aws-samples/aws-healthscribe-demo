// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

export type HighlightId = {
    allSegmentIds: string[];
    selectedSegmentId: string;
};

export type SmallTalkList = {
    BeginAudioTime: number;
    EndAudioTime: number;
}[];
