import { DetectEntitiesV2Response, Entity } from '@aws-sdk/client-comprehendmedical';

// Extracted Comprehend Medical output with a HealthScribe insights section name
export type ExtractedHealthData = {
    SectionName: string;
    ExtractedEntities: DetectEntitiesV2Response[];
};

// Segmentwith Comprehend Medical output in a HealthScribe insights section
export type SegmentExtractedData = {
    words: { word: string; linkedId: number[] }[];
    extractedData?: Entity[];
};

// Section with Comprehend Medical output
export type SummarySectionEntityMapping = {
    SectionName: string;
    Summary: SegmentExtractedData[];
};
