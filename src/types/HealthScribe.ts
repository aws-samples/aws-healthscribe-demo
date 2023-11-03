// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

export interface IAuraClinicalDocOutput {
    ClinicalDocumentation: { Sections: IAuraClinicalDocOutputSection[] | IAuraClinicalDocOutputSectionNew[] };
}

export interface IAuraClinicalDocOutputSection {
    SectionName: string;
    Subsections: {
        SubsectionName: string;
        Summary: IEvidence[];
    }[];
}

export interface IAuraClinicalDocOutputSectionNew {
    SectionName: string;
    Summary: IEvidenceNew[];
}

export interface IEvidenceNew {
    EvidenceLinks: {
        SegmentId: string;
    }[];

    SummarizedSegment: string;
}

export interface IEvidence {
    EvidenceMap: {
        SegmentId: string;
    }[];

    SummarizedSegment: string;
}
export interface IClinicalFields {
    Attributes: {
        AttributeId: string;
        Confidence: number;
        Spans: {
            BeginCharacterOffset: number;
            Content: string;
            EndCharacterOffset: number;
            SegmentId: string;
        }[];
        Type: string;
    }[];
    Category: string;
    Confidence: number;
    Spans: {
        BeginCharacterOffset: number;
        Content: string;
        EndCharacterOffset: number;
        SegmentId: string;
    }[];
    Traits: { Name: string; Score: number }[];
    Type: string;
    id: string;
}

export interface IAuraTranscriptOutput {
    Conversation: {
        ClinicalInsights: IClinicalInsights[];
        ConversationId: string;
        JobName: string;
        JobType: string;
        LanguageCode: string;
        TranscriptItems: ITranscriptItems[];
        TranscriptSegments: ITranscriptSegments[];
    };
}

export interface IClinicalInsightAttribute {
    AttributeId: string;
    Spans: {
        BeginCharacterOffset: number;
        Content: string;
        EndCharacterOffset: number;
        SegmentId: string;
    }[];
    Type: string;
}

export interface IClinicalInsights {
    Attributes: IClinicalInsightAttribute[];
    Category: string;
    InsightId: string;
    InsightType: string;
    Spans: {
        BeginCharacterOffset: number;
        Content: string;
        EndCharacterOffset: number;
        SegmentId: string;
    }[];
    Type: string;
}

export interface ITranscriptItems {
    ClinicalPhrase: IClinicalInsights;
    ClinicalEntity: IClinicalInsights;
    Alternatives: { Confidence: null; Content: string }[];
    BeginAudioTime: number;
    EndAudioTime: number;
    Type: string;
}

export interface ITranscriptSegments {
    BeginAudioTime: number;
    Content: string;
    EndAudioTime: number;
    ParticipantDetails: {
        ParticipantRole: string;
    };
    SectionDetails: {
        SectionName: string;
    };
    SegmentId: string;
}

export interface ITranscript extends ITranscriptSegments {
    Words: ITranscriptWord[];
}

export interface IWordAlternative {
    Confidence: number | null;
    Content: string;
}
export interface ITranscriptWord {
    ClinicalEntity: object;
    ClinicalPhrase: object;
    Alternatives: IWordAlternative[];
    BeginAudioTime: number;
    EndAudioTime: number;
    Type: string;
}

export interface ITranscriptContent {
    WordContent: { Word: string; BeginAudioTime: number; EndAudioTime: number }[];
    BeginAudioTime: number;
    EndAudioTime: number;
}

export interface IInsightIdAudioTimeDict {
    [key: string]: number;
}
