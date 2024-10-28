import React, { useEffect, useState } from 'react';

import Button from '@cloudscape-design/components/button';
import Form from '@cloudscape-design/components/form';
import Grid from '@cloudscape-design/components/grid';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';

import { useDebounce } from 'use-debounce';

import { ListHealthScribeJobsProps } from '@/utils/HealthScribeApi';

const STATUS_SELECTION = [
    { label: 'All', value: 'ALL' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Queued', value: 'QUEUED' },
    { label: 'Failed', value: 'FAILED' },
];

type ConversationsFilterProps = {
    listHealthScribeJobs: (searchFilter: ListHealthScribeJobsProps) => Promise<void>;
    setSearchParams: React.Dispatch<React.SetStateAction<ListHealthScribeJobsProps>>;
    searchParams: ListHealthScribeJobsProps;
};

export function ConversationsFilter({ listHealthScribeJobs, setSearchParams, searchParams }: ConversationsFilterProps) {
    const [debouncedSearchParams] = useDebounce<ListHealthScribeJobsProps>(searchParams, 500);

    // Update list initially & deboucned search params
    useEffect(() => {
        listHealthScribeJobs(debouncedSearchParams).catch(console.error);
    }, [debouncedSearchParams]);

    // Update searchParam to id: value
    function handleInputChange(id: string, value: string) {
        setSearchParams((currentSearchParams) => {
            return {
                ...currentSearchParams,
                [id]: value,
            };
        });
    }

    return (
        <Form>
            <Grid gridDefinition={[{ colspan: 5 }, { colspan: 3 }, { colspan: 2 }]}>
                <Input
                    placeholder="First Name or Last Name"
                    value={searchParams?.FirstNameOrLastNameContains || ''}
                    onChange={({ detail }) => handleInputChange('FirstNameOrLastNameContains', detail.value)}
                />
                <Select
                    selectedOption={STATUS_SELECTION.find((s) => s.value === searchParams?.Status) || null}
                    onChange={({ detail }) => handleInputChange('Status', detail.selectedOption.value || 'ALL')}
                    options={STATUS_SELECTION}
                    placeholder="Status"
                />
                <Button disabled={Object.keys(searchParams).length === 0} onClick={() => setSearchParams({})}>
                    Clear
                </Button>
            </Grid>
        </Form>
    );
}
