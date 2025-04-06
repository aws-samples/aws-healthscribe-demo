export interface IConversation {
    ClinicalInsights: IClinicalInsight[];
    ConversationId: string;
    LanguageCode: string;
    SessionId: string;
    TranscriptItems: ITranscriptItem[];
    TranscriptSegments: ITranscriptSegment[];
}

export interface IClinicalInsight {
    Attributes: IAttribute[];
    Category: string;
    InsightId: string;
    InsightType: string;
    Spans: ISpan[];
    Type: string;
}

export interface IAttribute {
    AttributeId: string;
    Spans: ISpan[];
    Type: string;
}

export interface ISpan {
    BeginCharacterOffset: number;
    Content: string;
    EndCharacterOffset: number;
    SegmentId: string;
}

export interface ITranscriptWordBatch {
    Confidence?: number;
    Content?: string;
}

export interface ITranscriptWordStream {
    Alternatives?: {
        Confidence?: number;
        Content?: string;
    }[];
}

// Async uses Alternatives
// Streaming uses Confidence/Content
export interface ITranscriptItem extends ITranscriptWordBatch, ITranscriptWordStream {
    BeginAudioTime: number;
    EndAudioTime: number;
    Type: 'pronunciation' | 'punctuation';
}

export interface ITranscriptSegment {
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

export interface IHealthScribeTranscript {
    Conversation: IConversation;
}

// Enriched types

export interface IProcessedItem extends ITranscriptItem {
    ClinicalEntity?: IClinicalInsight;
}

export interface IProcessedTranscript extends ITranscriptSegment {
    Words: IProcessedItem[];
}
