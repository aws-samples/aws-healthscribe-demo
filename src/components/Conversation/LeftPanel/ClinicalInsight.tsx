import React, { memo, useMemo } from 'react';

import SpaceBetween from '@cloudscape-design/components/space-between';

import ValueWithLabel from '@/components/Common/ValueWithLabel';
import { IClinicalInsight } from '@/types/HealthScribeTranscript';
import toTitleCase from '@/utils/toTitleCase';

import { OntologyLinking } from '../Common/OntologyLinking';
import ClinicalInsightsAttributesTable from './ClinicalInsightAttributesTable';

type ClinicalInsightProps = {
    wordClinicalEntity: IClinicalInsight;
};
function ClinicalInsight({ wordClinicalEntity }: ClinicalInsightProps) {
    const hasClinicalInsights = useMemo(() => {
        return typeof wordClinicalEntity !== 'undefined' && Object.keys(wordClinicalEntity)?.length > 0;
    }, [wordClinicalEntity]);

    if (hasClinicalInsights) {
        const clinicalInsight = wordClinicalEntity as IClinicalInsight;
        return (
            <SpaceBetween size="m" direction="vertical">
                <div>
                    <b>Clinical Insight: </b>
                    {clinicalInsight.Spans[0].Content}
                </div>
                <SpaceBetween size="m" direction="horizontal">
                    <ValueWithLabel label={'Category'}>
                        {toTitleCase(clinicalInsight.Category.replaceAll('_', ' '))}
                    </ValueWithLabel>
                    <ValueWithLabel label={'Type'}>
                        {toTitleCase(clinicalInsight.Type.replaceAll('_', ' '))}
                    </ValueWithLabel>
                </SpaceBetween>
                {clinicalInsight.Attributes.length > 0 && (
                    <ClinicalInsightsAttributesTable attributes={clinicalInsight.Attributes} />
                )}
                <OntologyLinking
                    category={clinicalInsight.Category}
                    type={clinicalInsight.Type}
                    text={clinicalInsight.Spans[0].Content}
                />
            </SpaceBetween>
        );
    } else {
        return;
    }
}

export default memo(ClinicalInsight);
