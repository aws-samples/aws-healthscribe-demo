import React, { memo, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import Button from '@cloudscape-design/components/button';
import Link from '@cloudscape-design/components/link';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';

import { InferICD10CMResponse, InferRxNormResponse, InferSNOMEDCTResponse } from '@aws-sdk/client-comprehendmedical';

import ValueWithLabel from '@/components/Common/ValueWithLabel';
import ClinicalInsightsAttributesTable from '@/components/Conversation/LeftPanel/ClinicalInsightAttributesTable';
import ClinicalInsightsInferredData from '@/components/Conversation/LeftPanel/ClinicalInsightsInferredData';
import { useAppSettingsContext } from '@/store/appSettings';
import { AppSettingKeys } from '@/store/appSettings/appSettings.type';
import { IClinicalInsights } from '@/types/HealthScribe';
import { getInferredData } from '@/utils/ComprehendMedicalApi';
import toTitleCase from '@/utils/toTitleCase';

// Comprehend Medical ontology linking API qualification categories and types
const ONTOLOGY_LINKING = [
    { key: 'icd10cm', name: 'ICD-10-CM', category: ['MEDICAL_CONDITION'], type: ['DX_NAME', 'TIME_EXPRESSION'] },
    { key: 'rxnorm', name: 'RxNorm', category: ['MEDICATION'] },
    { key: 'snomedct', name: 'SNOMED CT', category: ['MEDICAL_CONDITION', 'ANATOMY', 'TEST_TREATMENT_PROCEDURE'] },
];

export type InferredDataType = {
    [key: string]: false | 'loading' | InferICD10CMResponse | InferRxNormResponse | InferSNOMEDCTResponse;
};

type ClinicalInsightProps = {
    wordClinicalEntity: IClinicalInsights | object;
};

function ClinicalInsight({ wordClinicalEntity }: ClinicalInsightProps) {
    const navigate = useNavigate();
    const { appSettings } = useAppSettingsContext();
    const [inferredData, setInferredData] = useState<InferredDataType>({
        icd10cm: false,
        rxnorm: false,
        snomedct: false,
    });

    const comprehendMedicalDisabled = useMemo(
        () => appSettings[AppSettingKeys.ComprehendMedicalEnabled].value !== 'enabled',
        [appSettings]
    );

    const hasClinicalInsights = useMemo(() => {
        return typeof wordClinicalEntity !== 'undefined' && Object.keys(wordClinicalEntity)?.length > 0;
    }, [wordClinicalEntity]);

    async function handleInfer(inferName: string, text: string) {
        setInferredData({ ...inferredData, [inferName]: 'loading' });
        const comprehendMedicalResult = await getInferredData(inferName, text);
        setInferredData({ ...inferredData, [inferName]: comprehendMedicalResult });
    }

    function InsightActions({ clinicalInsight }: { clinicalInsight: IClinicalInsights }) {
        return (
            <div style={{ display: 'flex', columnGap: '5px', justifyContent: 'space-around' }}>
                {ONTOLOGY_LINKING.map((o) => {
                    if (o.category.includes(clinicalInsight.Category)) {
                        if (!!o.type && !o.type.includes(clinicalInsight.Type)) return;
                        return (
                            <Button
                                key={`button_${clinicalInsight.InsightId}_${o.key}`}
                                disabled={!!inferredData[o.key] || comprehendMedicalDisabled}
                                loading={inferredData[o.key] === 'loading'}
                                onClick={() => handleInfer(o.key, clinicalInsight.Spans[0].Content)}
                            >{`Infer ${o.name}`}</Button>
                        );
                    }
                })}
            </div>
        );
    }

    if (hasClinicalInsights) {
        const clinicalInsight = wordClinicalEntity as IClinicalInsights;
        return (
            <SpaceBetween size="m" direction="vertical">
                <div>
                    <b>Clinical Insight: </b>
                    {clinicalInsight.Spans[0].Content}
                </div>
                {comprehendMedicalDisabled && (
                    <StatusIndicator type="stopped">
                        <Link
                            onFollow={(e) => {
                                e.preventDefault();
                                navigate('/settings');
                            }}
                        >
                            Enable Amazon Comprehend Medical
                        </Link>{' '}
                        for ontology linking
                    </StatusIndicator>
                )}
                <InsightActions clinicalInsight={clinicalInsight} />
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
                <ClinicalInsightsInferredData inferredData={inferredData} />
            </SpaceBetween>
        );
    } else {
        return;
    }
}

export default memo(ClinicalInsight);
