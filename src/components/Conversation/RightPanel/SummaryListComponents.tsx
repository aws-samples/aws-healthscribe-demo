import React, { memo } from 'react';

import * as awsui from '@cloudscape-design/design-tokens';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import Popover from '@cloudscape-design/components/popover';
import SpaceBetween from '@cloudscape-design/components/space-between';

import { Entity } from '@aws-sdk/client-comprehendmedical';

import ValueWithLabel from '@/components/Common/ValueWithLabel';
import { SegmentExtractedData } from '@/types/ComprehendMedical';
import toTitleCase from '@/utils/toTitleCase';

import { OntologyLinking } from '../Common/OntologyLinking';
import styles from './SummarizedConcepts.module.css';

type RightWordPopoverProps = {
    word: string;
    wordData: Entity[];
};
function WordPopover({ word, wordData }: RightWordPopoverProps) {
    return (
        <Popover
            dismissButton={false}
            position="right"
            size="large"
            triggerType="custom"
            content={
                <SpaceBetween size={'xs'} direction={'vertical'}>
                    {wordData.map((data, index) => {
                        return (
                            <ExpandableSection key={`expandable_${index}`} defaultExpanded headerText={data.Text}>
                                <SpaceBetween size={'s'} direction={'vertical'}>
                                    <ValueWithLabel label={'Confidence'}>
                                        {Math.round((data.Score || 0) * 100)}%
                                    </ValueWithLabel>
                                    <SpaceBetween size="m" direction="horizontal">
                                        <ValueWithLabel label={'Category'}>
                                            {toTitleCase((data.Category || '').replaceAll('_', ' '))}
                                        </ValueWithLabel>
                                        <ValueWithLabel label={'Type'}>
                                            {toTitleCase((data.Type || '').replaceAll('_', ' '))}
                                        </ValueWithLabel>
                                    </SpaceBetween>
                                    {data.Attributes && data.Attributes.length > 0 && (
                                        <SpaceBetween size="m" direction="horizontal">
                                            <ValueWithLabel label={'Relationship To'}>
                                                {data.Attributes[0].Text}
                                            </ValueWithLabel>
                                            <ValueWithLabel label={'Type'}>
                                                {toTitleCase((data.Attributes[0].Type || '').replaceAll('_', ' '))}
                                            </ValueWithLabel>
                                            <ValueWithLabel label={'Score'}>
                                                {Math.round((data.Attributes[0].Score || 0) * 100)}%
                                            </ValueWithLabel>
                                        </SpaceBetween>
                                    )}
                                    {data.Text && (
                                        <OntologyLinking
                                            category={data.Category || ''}
                                            type={data.Type || ''}
                                            text={data.Text}
                                        />
                                    )}
                                </SpaceBetween>
                            </ExpandableSection>
                        );
                    })}
                </SpaceBetween>
            }
        >
            <span style={{ color: awsui.colorTextStatusInfo, fontWeight: 'bold' }}>{word}</span>
        </Popover>
    );
}
const WordPopoverComprehendMedical = memo(WordPopover);

type ExtractedHealthDataWordProps = {
    linkedId: number[];
    sectionExtractedData: SegmentExtractedData;
    word: string;
    acceptableConfidence: number;
};
export function ExtractedHealthDataWord({
    linkedId,
    sectionExtractedData,
    word,
    acceptableConfidence,
}: ExtractedHealthDataWordProps) {
    const wordData: Entity[] = [];
    linkedId.forEach((id) => {
        const foundData = (sectionExtractedData.extractedData || []).find((e) => e.Id === id);
        if (typeof foundData !== 'undefined' && foundData.Score && foundData.Score * 100 > acceptableConfidence)
            wordData.push(foundData);
    });

    return (
        <div className={styles.extractedHealthDataWord}>
            {wordData.length > 0 ? <WordPopoverComprehendMedical word={word} wordData={wordData} /> : word}{' '}
        </div>
    );
}
