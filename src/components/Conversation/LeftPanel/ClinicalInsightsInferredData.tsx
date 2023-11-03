import React from 'react';

import Box from '@cloudscape-design/components/box';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';

import {
    ICD10CMConcept,
    InferICD10CMResponse,
    InferRxNormResponse,
    InferSNOMEDCTResponse,
} from '@aws-sdk/client-comprehendmedical';

import getPercentageFromDecimal from '@/utils/getPercentageFromDecimal';

import { InferredDataType } from './ClinicalInsight';

type InferredDataProps = {
    items: ICD10CMConcept[] | undefined;
};

function InferredData({ items }: InferredDataProps) {
    if (typeof items === 'undefined') return null;
    return (
        <Table
            columnDefinitions={[
                {
                    id: 'code',
                    header: 'Code',
                    cell: (item) => item.Code,
                    sortingField: 'code',
                    isRowHeader: true,
                },
                {
                    id: 'description',
                    header: 'Description',
                    cell: (item) => item.Description,
                    sortingField: 'description',
                },
                {
                    id: 'score',
                    header: 'Score',
                    cell: (item) => getPercentageFromDecimal(item.Score),
                    sortingField: 'score',
                },
            ]}
            items={items}
            sortingDisabled={true}
            loadingText="Loading items"
            empty={
                <Box margin={{ vertical: 'xs' }} textAlign="center" color="inherit">
                    <SpaceBetween size="m">
                        <b>No items</b>
                    </SpaceBetween>
                </Box>
            }
            variant={'embedded'}
        />
    );
}

type OntologyLinkingProps = { inferredData: InferredDataType };
// Function to display an expandable selection with data from Comprehend Medical
export default function OntologyLinking({ inferredData }: OntologyLinkingProps) {
    return (
        <div>
            {typeof inferredData.icd10cm === 'object' && (
                <ExpandableSection defaultExpanded headerText="ICD-10-CM">
                    <InferredData
                        items={(inferredData.icd10cm as InferICD10CMResponse).Entities?.[0]?.ICD10CMConcepts}
                    />
                    <SpaceBetween size={'s'} direction={'vertical'}>
                        <div>
                            <b>Score:</b> {getPercentageFromDecimal(inferredData.icd10cm?.Entities?.[0]?.Score)}
                        </div>
                    </SpaceBetween>
                </ExpandableSection>
            )}
            {typeof inferredData.rxnorm === 'object' && (
                <ExpandableSection defaultExpanded headerText="RxNorm">
                    <InferredData items={(inferredData.rxnorm as InferRxNormResponse).Entities?.[0]?.RxNormConcepts} />
                    <SpaceBetween size={'s'} direction={'vertical'}>
                        <div>
                            <b>Score:</b> {getPercentageFromDecimal(inferredData.rxnorm?.Entities?.[0]?.Score)}
                        </div>
                    </SpaceBetween>
                </ExpandableSection>
            )}
            {typeof inferredData.snomedct === 'object' && (
                <ExpandableSection defaultExpanded headerText="SNOMED-CT">
                    <InferredData
                        items={(inferredData.snomedct as InferSNOMEDCTResponse).Entities?.[0]?.SNOMEDCTConcepts}
                    />
                    <SpaceBetween size={'s'} direction={'vertical'}>
                        <div>
                            <b>Score:</b> {getPercentageFromDecimal(inferredData.snomedct?.Entities?.[0]?.Score)}
                        </div>
                    </SpaceBetween>
                </ExpandableSection>
            )}
        </div>
    );
}
