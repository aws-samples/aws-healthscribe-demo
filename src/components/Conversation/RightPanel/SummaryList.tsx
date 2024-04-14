import React from 'react';

import * as awsui from '@cloudscape-design/design-tokens';
import Box from '@cloudscape-design/components/box';

import styles from '@/components/Conversation/RightPanel/SummarizedConcepts.module.css';
import { IEvidence } from '@/types/HealthScribe';

import { processSummarizedSegment } from './summarizedConceptsUtils';

type SummaryListProps = {
    sectionName: string;
    summary: IEvidence[];
    currentSegment: string;
    handleClick: (SummarizedSegment: string, EvidenceLinks: { SegmentId: string }[]) => void;
};
export default function SummaryList({ sectionName, summary, currentSegment = '', handleClick }: SummaryListProps) {
    if (summary.length) {
        return (
            <ul className={styles.summaryList}>
                {summary.map(({ EvidenceLinks, SummarizedSegment }, index) => {
                    if (SummarizedSegment === '') return false;

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

                    return (
                        <div key={`${sectionName}_${index}`}>
                            {sectionHeader && <div className={styles.summaryListItemSubHeader}>{sectionHeader}</div>}
                            <li className={`${styles.summaryListItem} ${indent && styles.summaryListItemIndent}`}>
                                <div
                                    onClick={() => handleClick(SummarizedSegment, EvidenceLinks)}
                                    className={styles.summarizedSegment}
                                    style={{
                                        display: 'inline',
                                        color: awsui.colorTextBodyDefault,
                                        backgroundColor:
                                            currentSegment === SummarizedSegment
                                                ? awsui.colorBackgroundToggleCheckedDisabled
                                                : '',
                                    }}
                                >
                                    {processSummarizedSegment(SummarizedSegment)}
                                </div>
                            </li>
                        </div>
                    );
                })}
            </ul>
        );
    } else {
        return (
            <div style={{ paddingLeft: '5px' }}>
                <Box variant="small">No Clinical Entities</Box>
            </div>
        );
    }
}
