import { IAuraClinicalDocOutputSection, IEvidence } from '@/types/HealthScribe';

import { SECTION_ORDER } from './sectionOrder';

/**
 * Remove leading dashes and trims the string
 * E.g. " - summary" returns "summary"
 */
export function processSummarizedSegment(summarizedSegment: string): string {
    return summarizedSegment.trim().replace(/^-/, '').trim();
}

/**
 * The PLAN section contains a header in SummarizedSegment, separated by a newline character
 * This helper function returns an object with the header as a key in the Summary object,
 * Instead of an array that is normally returned
 */
export function processSections(sections: IAuraClinicalDocOutputSection[]) {
    return sections
        .map((s) => {
            if (s.SectionName === 'PLAN') {
                let currentPlanHeader: string = 'null';
                const updatedSummary: { [header: string]: IEvidence[] } = {};
                // iterate over each evidence segement. if there is a string with multiple line breaks, then the
                // string before the first line break is the section header
                for (const evidenceSegment of s.Summary) {
                    const summarizedSegmentObjects = evidenceSegment.SummarizedSegment.trim().split('\n');
                    if (summarizedSegmentObjects.length > 1) {
                        currentPlanHeader = summarizedSegmentObjects.shift() as string;
                        updatedSummary[currentPlanHeader] = [];
                        updatedSummary[currentPlanHeader].push({
                            EvidenceLinks: evidenceSegment.EvidenceLinks,
                            SummarizedSegment: summarizedSegmentObjects.join(''),
                        });
                    } else {
                        if (!Object.keys(updatedSummary).includes(currentPlanHeader))
                            updatedSummary[currentPlanHeader] = [];
                        updatedSummary[currentPlanHeader].push(evidenceSegment);
                    }
                }
                return {
                    SectionName: 'PLAN',
                    Summary: updatedSummary,
                };
            } else {
                return s;
            }
        })
        .sort((a, b) => SECTION_ORDER.indexOf(a.SectionName) - SECTION_ORDER.indexOf(b.SectionName) || 1);
}
