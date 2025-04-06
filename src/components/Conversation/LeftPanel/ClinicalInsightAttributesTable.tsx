import React from 'react';

import Box from '@cloudscape-design/components/box';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';

import { IAttribute } from '@/types/HealthScribeTranscript';
import toTitleCase from '@/utils/toTitleCase';

type ClinicalInsightsAttributesTableProps = {
    attributes: IAttribute[];
};
export default function ClinicalInsightsAttributesTable({ attributes }: ClinicalInsightsAttributesTableProps) {
    return (
        <ExpandableSection defaultExpanded headerText="Attributes">
            <Table
                columnDefinitions={[
                    {
                        id: 'type',
                        header: 'Type',
                        cell: (item) => toTitleCase(item.Type.replaceAll('_', ' ')),
                        sortingField: 'type',
                        isRowHeader: true,
                    },
                    { id: 'Entity', header: 'Entity', cell: (item) => item.Spans[0].Content, sortingField: 'entity' },
                ]}
                items={attributes}
                loadingText="Loading attributes"
                sortingDisabled
                empty={
                    <Box margin={{ vertical: 'xs' }} textAlign="center" color="inherit">
                        <SpaceBetween size="m">
                            <b>No attributes</b>
                        </SpaceBetween>
                    </Box>
                }
                variant={'embedded'}
            />
        </ExpandableSection>
    );
}
