import { ExtractedHealthData, SegmentExtractedData, SummarySectionEntityMapping } from '@/types/ComprehendMedical';
import { IAuraClinicalDocOutputSection } from '@/types/HealthScribe';
import { flattenAndUnique } from '@/utils/array';

/**
 * Remove leading dashes and trims the string
 * E.g. " - summary" returns "summary"
 */
export function processSummarizedSegment(summarizedSegment: string): string {
    return summarizedSegment.trim().replace(/^-/, '').trim();
}

/**
 * Merge HealthScribe output with Comprehend Medical output
 * @param sections - HealthScribe output sections
 * @param sectionsWithEntities - Comprehend Medical output sections
 * @returns SummarySectionEntityMapping[]
 */
export function mergeHealthScribeOutputWithComprehendMedicalOutput(
    sections: IAuraClinicalDocOutputSection[],
    sectionsWithEntities: ExtractedHealthData[]
): SummarySectionEntityMapping[] {
    if (sections.length === 0 || sectionsWithEntities.length === 0) return [];

    const buildSectionsWithExtractedData: SummarySectionEntityMapping[] = [];

    sections.forEach((section) => {
        const sectionName = section.SectionName;
        const sectionWithEntities = sectionsWithEntities.find((s) => s.SectionName === sectionName);

        const currentSectionExtractedData: SegmentExtractedData[] = [];
        section.Summary.forEach((summary, i) => {
            const segmentExtractedData: SegmentExtractedData = { words: [] };
            const summarizedSegment = processSummarizedSegment(summary.SummarizedSegment);
            const summarizedSegmentSplit = summarizedSegment.split(' ');
            if (typeof sectionWithEntities === 'undefined') return;
            const segmentEvidence = sectionWithEntities?.ExtractedEntities?.[i]?.Entities || [];
            segmentExtractedData.words = summarizedSegmentSplit.map((w) => {
                return { word: w, linkedId: [] };
            });
            segmentExtractedData.extractedData = segmentEvidence;

            // offset character map. key: character index, value: array of extractedData ids
            const offsetIdMap = new Map();
            segmentExtractedData.extractedData.forEach(({ BeginOffset, EndOffset, Id }) => {
                if (typeof BeginOffset === 'number' && typeof EndOffset === 'number') {
                    for (let i = BeginOffset; i <= EndOffset; i++) {
                        if (!offsetIdMap.has(i)) {
                            offsetIdMap.set(i, []);
                        }
                        offsetIdMap.get(i).push(Id);
                    }
                }
            });

            // iterate over each word by character. if the character appears in the offset map,
            // find the unique extracted data ids and append it to the word object
            let charCount = 0;
            let charCurrent = 0;
            for (let wordIndex = 0; wordIndex < summarizedSegmentSplit.length; wordIndex++) {
                const word = summarizedSegmentSplit[wordIndex];
                const wordLength = word.length;
                charCount += wordLength + 1;
                const wordDataIds = [];
                // iterate from the current character to the current character + word length + 1 (space)
                while (charCurrent < charCount) {
                    wordDataIds.push(offsetIdMap.get(charCurrent) || []);
                    charCurrent++;
                }
                segmentExtractedData.words[wordIndex].linkedId = flattenAndUnique(wordDataIds);

                // break out of the loop if there's no more extracted health data
                if (charCount >= Math.max(...offsetIdMap.keys())) break;
            }

            currentSectionExtractedData.push(segmentExtractedData);
        });
        buildSectionsWithExtractedData.push({
            SectionName: sectionName,
            Summary: currentSectionExtractedData,
        });
    });
    return buildSectionsWithExtractedData;
}
