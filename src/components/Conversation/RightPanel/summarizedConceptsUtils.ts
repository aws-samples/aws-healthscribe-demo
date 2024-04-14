/**
 * Remove leading dashes and trims the string
 * E.g. " - summary" returns "summary"
 */
export function processSummarizedSegment(summarizedSegment: string): string {
    return summarizedSegment.trim().replace(/^-/, '').trim();
}
