export type IEvidenceLink = {
    SegmentId: string;
};

export type ISummaryItem = {
    EvidenceLinks: IEvidenceLink[];
    SummarizedSegment: string;
};

export type ISection = {
    SectionName: string;
    Summary: ISummaryItem[];
};

export type IClinicalDocumentation = {
    Sections: ISection[];
    SessionId: string;
};

export type IHealthScribeSummary = {
    ClinicalDocumentation: IClinicalDocumentation;
};
