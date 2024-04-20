import React from 'react';

import * as awsui from '@cloudscape-design/design-tokens';
import Box from '@cloudscape-design/components/box';

import { SegmentExtractedData } from '@/types/ComprehendMedical';
import { IEvidence } from '@/types/HealthScribe';

import styles from './SummarizedConcepts.module.css';
import { ExtractedHealthDataWord } from './SummaryListComponents';
import { processSummarizedSegment } from './summarizedConceptsUtils';

function NoEntities() {
    return (
        <div style={{ paddingLeft: '5px' }}>
            <Box variant="small">No Clinical Entities</Box>
        </div>
    );
}

type SummaryListDefaultProps = {
    sectionName: string;
    summary: IEvidence[];
    summaryExtractedHealthData?: SegmentExtractedData[];
    acceptableConfidence: number;
    currentSegment: string;
    handleSegmentClick: (SummarizedSegment: string, EvidenceLinks: { SegmentId: string }[]) => void;
};
export function SummaryListDefault({
    sectionName,
    summary,
    summaryExtractedHealthData,
    acceptableConfidence,
    currentSegment = '',
    handleSegmentClick,
}: SummaryListDefaultProps) {
    if (summary.length) {
        return (
            <ul className={styles.summaryList}>
                {summary.map(({ EvidenceLinks, SummarizedSegment }, sectionIndex) => {
                    if (SummarizedSegment === '') return false;

                    // Check if the segment is a section header
                    let sectionHeader = '';
                    let indent = false;
                    if (SummarizedSegment.endsWith('\n')) {
                        const splitSegement = SummarizedSegment.split('\n');
                        if (SummarizedSegment.split('\n').length === 3) {
                            sectionHeader = splitSegement[0];
                            SummarizedSegment = SummarizedSegment.substring(SummarizedSegment.indexOf('\n') + 1);
                        }
                        indent = true;
                    }
                    const sectionHeaderWordLength = sectionHeader ? sectionHeader.split(' ').length : 0;

                    const summaryItemDivStyle = {
                        color: awsui.colorTextBodyDefault,
                        backgroundColor:
                            currentSegment === SummarizedSegment ? awsui.colorBackgroundToggleCheckedDisabled : '',
                    };

                    if (summaryExtractedHealthData) {
                        const sectionExtractedData = summaryExtractedHealthData[sectionIndex];
                        return (
                            <div key={`${sectionName}_${sectionIndex}`}>
                                {sectionHeaderWordLength > 0 && (
                                    <div className={styles.summaryListItemSubHeader}>
                                        {sectionExtractedData.words
                                            .slice(0, sectionHeaderWordLength)
                                            .map(({ word, linkedId }, wordIndex) => (
                                                <ExtractedHealthDataWord
                                                    key={`${sectionName}_${sectionIndex}_${wordIndex}`}
                                                    linkedId={linkedId}
                                                    sectionExtractedData={sectionExtractedData}
                                                    word={word}
                                                    acceptableConfidence={acceptableConfidence}
                                                />
                                            ))}
                                    </div>
                                )}
                                <li className={`${styles.summaryListItem} ${indent && styles.summaryListItemIndent}`}>
                                    <div
                                        onClick={() => handleSegmentClick(SummarizedSegment, EvidenceLinks)}
                                        className={styles.summarizedSegment}
                                        style={summaryItemDivStyle}
                                    >
                                        {sectionExtractedData.words
                                            .slice(sectionHeaderWordLength)
                                            .map(({ word, linkedId }, wordIndex) => {
                                                if (word === '-' && wordIndex <= 1) return false;

                                                return (
                                                    <ExtractedHealthDataWord
                                                        key={`${sectionName}_${sectionIndex}_${wordIndex}`}
                                                        linkedId={linkedId}
                                                        sectionExtractedData={sectionExtractedData}
                                                        word={word}
                                                        acceptableConfidence={acceptableConfidence}
                                                    />
                                                );
                                            })}
                                    </div>
                                </li>
                            </div>
                        );
                    } else {
                        return (
                            <div key={`${sectionName}_${sectionIndex}`}>
                                {sectionHeader && (
                                    <div className={styles.summaryListItemSubHeader}>{sectionHeader}</div>
                                )}
                                <li className={`${styles.summaryListItem} ${indent && styles.summaryListItemIndent}`}>
                                    <div
                                        onClick={() => handleSegmentClick(SummarizedSegment, EvidenceLinks)}
                                        className={styles.summarizedSegment}
                                        style={summaryItemDivStyle}
                                    >
                                        {processSummarizedSegment(SummarizedSegment)}
                                    </div>
                                </li>
                            </div>
                        );
                    }
                })}
            </ul>
        );
    } else {
        return <NoEntities />;
    }
}
