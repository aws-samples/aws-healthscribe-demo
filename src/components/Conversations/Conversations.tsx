// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useCollection } from '@cloudscape-design/collection-hooks';
import Button from '@cloudscape-design/components/button';
import { CollectionPreferencesProps } from '@cloudscape-design/components/collection-preferences';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Pagination from '@cloudscape-design/components/pagination';
import Table from '@cloudscape-design/components/table';

import { MedicalScribeJobSummary } from '@aws-sdk/client-transcribe';

import { ConversationsFilter } from '@/components/Conversations/ConversationsFilter';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useNotificationsContext } from '@/store/notifications';
import { ListHealthScribeJobsProps, getHealthScribeJob, listHealthScribeJobs } from '@/utils/HealthScribeApi';

import { ConversationsHeaderActions } from './ConversationsHeaderActions';
import TableEmptyState from './TableEmptyState';
import { TablePreferences } from './TablePreferences';
import { columnDefs } from './conversationsColumnDefs';
import { DEFAULT_PREFERENCES } from './conversationsPrefs';

type MoreHealthScribeJobs = {
    searchFilter?: ListHealthScribeJobsProps;
    NextToken?: string;
};

interface MedicalSoapJobSummary extends MedicalScribeJobSummary {
    firstName?: string;
    lastName?: string;
    appointmentDate?: string;
    appointmentDuration?: string;
}

export default function Conversations() {
    const { addFlashMessage } = useNotificationsContext();

    const [healthScribeJobs, setHealthScribeJobs] = useState<MedicalScribeJobSummary[]>([]); // HealthScribe jobs from API
    const [moreHealthScribeJobs, setMoreHealthScribeJobs] = useState<MoreHealthScribeJobs>({}); // More HealthScribe jobs from API (NextToken returned)
    const [selectedHealthScribeJob, setSelectedHealthScribeJob] = useState<MedicalScribeJobSummary[] | []>([]); // Selected HealthScribe job

    const [tableLoading, setTableLoading] = useState(false); // Loading state for table

    const [preferences, setPreferences] = useLocalStorage<CollectionPreferencesProps.Preferences>(
        'Conversations-Table-Preferences',
        DEFAULT_PREFERENCES
    ); // Conversation table preferences

    const [searchParams, setSearchParams] = useState<ListHealthScribeJobsProps>({});

    // Header counter for the number of HealthScribe jobs
    const headerCounterText = `(${healthScribeJobs.length}${Object.keys(moreHealthScribeJobs).length > 0 ? '+' : ''})`;

    // Call Transcribe API to list HealthScribe jobs - optional search filter
    const listHealthScribeJobsWrapper = useCallback(async (searchFilter: ListHealthScribeJobsProps) => {
        setTableLoading(true);
        try {
            // TableHeader may set a Status of 'ALL' - remove this as it's not a valid status
            const processedSearchFilter = { ...searchFilter };
            if (processedSearchFilter.Status === 'ALL') {
                processedSearchFilter.Status = undefined;
            }
            const listHealthScribeJobsRsp = await listHealthScribeJobs(processedSearchFilter);

            // Handle undefined MedicalScribeJobSummaries (the service should return an empty array)
            if (typeof listHealthScribeJobsRsp.MedicalScribeJobSummaries === 'undefined') {
                setHealthScribeJobs([]);
                setTableLoading(false);
                return;
            }

            let listResults: MedicalSoapJobSummary[] = listHealthScribeJobsRsp.MedicalScribeJobSummaries;

            const jobPromises = listResults.map(async (job) => {
                const healthSoapJobDetail = await getHealthScribeJob({
                    MedicalScribeJobName: job.MedicalScribeJobName || '',
                });

                job.firstName = '';
                job.lastName = '';
                job.appointmentDate = '';
                job.appointmentDuration = '';

                if (healthSoapJobDetail.MedicalScribeJob && healthSoapJobDetail.MedicalScribeJob?.Tags) {
                    const tags = healthSoapJobDetail.MedicalScribeJob.Tags;
                    job.firstName = tags.find((t) => t.Key === 'firstName')?.Value || '';
                    job.lastName = tags.find((t) => t.Key === 'lastName')?.Value || '';
                    job.appointmentDate = tags.find((t) => t.Key === 'appointment')?.Value || '';
                    job.appointmentDuration = tags.find((t) => t.Key === 'duration')?.Value || '';
                }
            });
            await Promise.all(jobPromises);

            // Filter listResults based on firstName and lastName
            if (searchFilter.FirstNameOrLastNameContains) {
                const filterString = searchFilter.FirstNameOrLastNameContains.toLowerCase();
                listResults = listResults.filter(
                    (job) =>
                        (job.firstName?.toLowerCase() || '').includes(filterString) ||
                        (job.lastName?.toLowerCase() || '').includes(filterString)
                );
            }

            // if NextToken is specified, append search results to existing results
            if (processedSearchFilter.NextToken) {
                setHealthScribeJobs((prevHealthScribeJobs) => prevHealthScribeJobs.concat(listResults));
            } else {
                setHealthScribeJobs(listResults);
            }

            //If the research returned NextToken, there are additional jobs. Set moreHealthScribeJobs to enable pagination
            if (listHealthScribeJobsRsp?.NextToken) {
                setMoreHealthScribeJobs({
                    searchFilter: searchFilter,
                    NextToken: listHealthScribeJobsRsp?.NextToken,
                });
            } else {
                setMoreHealthScribeJobs({});
            }
        } catch (e: unknown) {
            setTableLoading(false);
            addFlashMessage({
                id: e?.toString() || 'ListHealthScribeJobs error',
                header: 'Conversations Error',
                content: e?.toString() || 'ListHealthScribeJobs error',
                type: 'error',
            });
        }
        setTableLoading(false);
    }, []);

    // Property for <Pagination /> to enable ... on navigation if there are additional HealthScribe jobs
    const openEndPaginationProp = useMemo(() => {
        if (Object.keys(moreHealthScribeJobs).length > 0) {
            return { openEnd: true };
        } else {
            return {};
        }
    }, [moreHealthScribeJobs]);

    // Refresh healthscribe jobs with search params
    async function refreshTable() {
        await listHealthScribeJobsWrapper(searchParams);
    }

    // Table collection
    const { items, actions, collectionProps, paginationProps } = useCollection(healthScribeJobs, {
        filtering: {
            empty: <TableEmptyState title="No HealthScribe jobs" subtitle="Try clearing the search filter." />,
            noMatch: (
                <TableEmptyState
                    title="No matches"
                    subtitle="We cannot find a match."
                    action={<Button onClick={() => actions.setFiltering('')}>Clear filter</Button>}
                />
            ),
        },
        pagination: { pageSize: preferences.pageSize },
        sorting: {},
        selection: {},
    });

    // List conversations initially
    useEffect(() => {
        void refreshTable();
    }, []);

    return (
        <ContentLayout
            headerVariant={'high-contrast'}
            header={
                <Header
                    variant="awsui-h1-sticky"
                    description="View existing appointments"
                    counter={headerCounterText}
                    actions={
                        <ConversationsHeaderActions
                            selectedHealthScribeJob={selectedHealthScribeJob}
                            refreshTable={refreshTable}
                        />
                    }
                >
                    Appointments
                </Header>
            }
        >
            <Table
                {...collectionProps}
                columnDefinitions={columnDefs}
                columnDisplay={preferences.contentDisplay}
                contentDensity={preferences.contentDensity}
                filter={
                    <ConversationsFilter
                        listHealthScribeJobs={listHealthScribeJobsWrapper}
                        searchParams={searchParams}
                        setSearchParams={setSearchParams}
                    />
                }
                items={items}
                loading={tableLoading}
                loadingText="Loading HealthScribe jobs"
                onSelectionChange={({ detail }) => setSelectedHealthScribeJob(detail.selectedItems)}
                pagination={
                    <Pagination
                        {...openEndPaginationProp}
                        {...paginationProps}
                        onChange={(event) => {
                            if (event.detail?.currentPageIndex > paginationProps.pagesCount) {
                                listHealthScribeJobsWrapper({
                                    ...moreHealthScribeJobs.searchFilter,
                                    NextToken: moreHealthScribeJobs.NextToken,
                                }).catch(console.error);
                            }
                            paginationProps.onChange(event);
                        }}
                    />
                }
                preferences={<TablePreferences preferences={preferences} setPreferences={setPreferences} />}
                resizableColumns={true}
                selectedItems={selectedHealthScribeJob}
                selectionType="single"
                stickyColumns={preferences.stickyColumns}
                stickyHeader={true}
                stripedRows={preferences.stripedRows}
                trackBy="MedicalScribeJobName"
                variant="container"
                wrapLines={preferences.wrapLines}
            />
        </ContentLayout>
    );
}
