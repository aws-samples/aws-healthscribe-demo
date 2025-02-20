import { IHealthScribeSummary } from '@/types/HealthScribeSummary';

import { processSummarizedSegment } from './summarizedConceptsUtils';

export function calculateNereUnits(clinicalDocument: IHealthScribeSummary | undefined) {
    if (!clinicalDocument) return 0;
    const eachSegment = clinicalDocument.ClinicalDocumentation.Sections.reduce((acc, { Summary }) => {
        return (
            acc +
            Summary.reduce((acc, { SummarizedSegment }) => {
                return acc + Math.ceil(processSummarizedSegment(SummarizedSegment).length / 100);
            }, 0)
        );
    }, 0);

    const eachSection = clinicalDocument.ClinicalDocumentation.Sections.reduce((acc, { Summary }) => {
        return (
            acc +
            Math.ceil(
                Summary.reduce((acc, { SummarizedSegment }) => {
                    return acc + processSummarizedSegment(SummarizedSegment).length;
                }, 0) / 100
            )
        );
    }, 0);

    const allAtOnce = Math.ceil(
        clinicalDocument.ClinicalDocumentation.Sections.reduce((acc, { Summary }) => {
            return (
                acc +
                Summary.reduce((acc, { SummarizedSegment }) => {
                    return acc + processSummarizedSegment(SummarizedSegment).length;
                }, 0)
            );
        }, 0) / 100
    );

    return {
        eachSegment: eachSegment,
        eachSection: eachSection,
        allAtOnce: allAtOnce,
    };
}
