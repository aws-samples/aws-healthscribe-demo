// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

export type HealthScribeJob = {
    ChannelDefinitions?: [
        {
            ChannelId: number;
            ParticipantRole: string;
        },
    ];
    CompletionTime?: number;
    CreationTime?: number;
    DataAccessRoleArn?: string;
    FailureReason?: string;
    LanguageCode?: string;
    Media?: {
        MediaFileUri?: string;
        RedactedMediaFileUri?: string;
    };
    MedicalScribeJobName?: string;
    MedicalScribeJobStatus?: string;
    MedicalScribeOutput?: {
        ClinicalDocumentUri: string;
        TranscriptFileUri: string;
    };
    Settings?: {
        ChannelIdentification?: boolean;
        MaxSpeakerLabels?: number;
        ShowSpeakerLabels?: boolean;
        VocabularyFilterMethod?: string;
        VocabularyFilterName?: string;
        VocabularyName?: string;
    };
    StartTime?: number;
    Tags?: [
        {
            Key: string;
            Value: string;
        },
    ];
};

export type HighlightId = {
    allSegmentIds: string[];
    selectedSegmentId: string;
};

export type SmallTalkList = {
    BeginAudioTime: number;
    EndAudioTime: number;
}[];
