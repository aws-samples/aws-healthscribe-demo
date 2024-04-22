import React from 'react';

import Button from '@cloudscape-design/components/button';

import { InferICD10CMResponse, InferRxNormResponse, InferSNOMEDCTResponse } from '@aws-sdk/client-comprehendmedical';

import { useAppSettingsContext } from '@/store/appSettings';
import { getInferredData } from '@/utils/ComprehendMedicalApi';

import { EnableComprehendMedicalPopover } from '../Common/ComprehendMedical';
import OntologyLinkingData from './OntologyLinkingData';

// Comprehend Medical ontology linking API qualification categories and types
const ONTOLOGY_LINKING = [
    { key: 'icd10cm', name: 'ICD-10-CM', category: ['MEDICAL_CONDITION'], type: ['DX_NAME', 'TIME_EXPRESSION'] },
    { key: 'rxnorm', name: 'RxNorm', category: ['MEDICATION'] },
    { key: 'snomedct', name: 'SNOMED CT', category: ['MEDICAL_CONDITION', 'ANATOMY', 'TEST_TREATMENT_PROCEDURE'] },
];

export type InferredDataType = {
    [key: string]: false | 'loading' | InferICD10CMResponse | InferRxNormResponse | InferSNOMEDCTResponse;
};

type OntologyLinkingProps = {
    category: string;
    type: string;
    text: string;
};

export function OntologyLinking({ category, type, text }: OntologyLinkingProps) {
    const { comprehendMedicalEnabled } = useAppSettingsContext();
    const [inferredData, setInferredData] = React.useState<InferredDataType>({
        icd10cm: false,
        rxnorm: false,
        snomedct: false,
    });

    async function handleInfer(ontologyType: string, text: string) {
        setInferredData({ ...inferredData, [ontologyType]: 'loading' });
        const comprehendMedicalResult = await getInferredData(ontologyType, text);
        setInferredData({ ...inferredData, [ontologyType]: comprehendMedicalResult });
    }

    return (
        <>
            <div
                style={{ display: 'flex', columnGap: '5px', justifyContent: 'space-around', alignItems: 'center' + '' }}
            >
                {ONTOLOGY_LINKING.map((o, index) => {
                    if (o.category.includes(category)) {
                        if (!!o.type && !o.type.includes(type)) return;
                        return (
                            <Button
                                key={`button_${text}_${index}`}
                                disabled={!!inferredData[o.key] || !comprehendMedicalEnabled}
                                loading={inferredData[o.key] === 'loading'}
                                onClick={() => handleInfer(o.key, text)}
                            >{`Infer ${o.name}`}</Button>
                        );
                    }
                })}
                <EnableComprehendMedicalPopover />
            </div>
            <OntologyLinkingData inferredData={inferredData} />
        </>
    );
}
