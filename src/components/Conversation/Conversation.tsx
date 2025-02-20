// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { Suspense, lazy, useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import ContentLayout from '@cloudscape-design/components/content-layout';
import Grid from '@cloudscape-design/components/grid';

import { MedicalScribeJob } from '@aws-sdk/client-transcribe';

import ModalLoader from '@/components/SuspenseLoader/ModalLoader';
import { useAudio } from '@/hooks/useAudio';
import { useNotificationsContext } from '@/store/notifications';
import { IHealthScribeSummary } from '@/types/HealthScribeSummary';
import { IHealthScribeTranscript } from '@/types/HealthScribeTranscript';
import { getHealthScribeJob } from '@/utils/HealthScribeApi';
import { getObject, getS3Object } from '@/utils/S3Api';

import { ConversationHeader } from './ConversationHeader';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import TopPanel from './TopPanel';

const ViewOutput = lazy(() => import('./ViewOutput'));

export default function Conversation() {
    const { conversationName } = useParams();
    const { addFlashMessage } = useNotificationsContext();

    const [jobLoading, setJobLoading] = useState(true); // Is getHealthScribeJob in progress
    const [jobDetails, setJobDetails] = useState<MedicalScribeJob | null>(null); // HealthScribe job details
    const [showOutputModal, setShowOutputModal] = useState<boolean>(false); // Is view results modal open

    // Outputs - transcript and summary. Set after stream is in a completed status
    const [transcript, setTranscript] = useState<IHealthScribeTranscript>();
    const [summary, setSummary] = useState<IHealthScribeSummary>();

    const [
        wavesurfer,
        audioReady,
        setAudioReady,
        audioTime,
        setAudioTime,
        smallTalkCheck,
        setSmallTalkCheck,
        highlightId,
        setHighlightId,
    ] = useAudio();

    useEffect(() => {
        async function getJob(conversationName: string) {
            try {
                setJobLoading(true);
                const getHealthScribeJobRsp = await getHealthScribeJob({ MedicalScribeJobName: conversationName });
                const medicalScribeJob = getHealthScribeJobRsp?.MedicalScribeJob;

                if (typeof medicalScribeJob === 'undefined') return;
                if (Object.keys(medicalScribeJob).length > 0) {
                    setJobDetails(medicalScribeJob);
                }

                // Get Transcript File from result S3 URL
                const transcriptFileUri = medicalScribeJob.MedicalScribeOutput?.TranscriptFileUri;
                const transcriptFileRsp = await getObject(getS3Object(transcriptFileUri || ''));
                setTranscript(JSON.parse((await transcriptFileRsp?.Body?.transformToString()) || ''));

                // Get Clinical Document from result S3 URL
                const clinicalDocumentUri = medicalScribeJob.MedicalScribeOutput?.ClinicalDocumentUri;
                const clinicalDocumentRsp = await getObject(getS3Object(clinicalDocumentUri || ''));
                setSummary(JSON.parse((await clinicalDocumentRsp?.Body?.transformToString()) || ''));
            } catch (e) {
                setJobDetails(null);
                setJobLoading(false);
                addFlashMessage({
                    id: e?.toString() || 'GetHealthScribeJob error',
                    header: 'Conversation Error',
                    content: e?.toString() || 'GetHealthScribeJob error',
                    type: 'error',
                });
            }
            setJobLoading(false);
        }
        if (!conversationName) {
            return;
        } else {
            getJob(conversationName).catch(console.error);
        }
    }, []);

    return (
        <ContentLayout
            headerVariant={'high-contrast'}
            header={<ConversationHeader jobDetails={jobDetails} setShowOutputModal={setShowOutputModal} />}
        >
            {showOutputModal && (
                <Suspense fallback={<ModalLoader />}>
                    <ViewOutput
                        setVisible={setShowOutputModal}
                        transcriptString={JSON.stringify(transcript || 'Loading...', null, 2)}
                        clinicalDocumentString={JSON.stringify(summary || 'Loading...', null, 2)}
                    />
                </Suspense>
            )}
            <Grid
                gridDefinition={[
                    { colspan: { default: 12 } },
                    { colspan: { default: 6 } },
                    { colspan: { default: 6 } },
                ]}
            >
                <TopPanel
                    jobLoading={jobLoading}
                    jobDetails={jobDetails}
                    transcript={transcript}
                    wavesurfer={wavesurfer}
                    smallTalkCheck={smallTalkCheck}
                    setSmallTalkCheck={setSmallTalkCheck}
                    setAudioTime={setAudioTime}
                    setAudioReady={setAudioReady}
                />
                <LeftPanel
                    jobLoading={jobLoading}
                    transcript={transcript}
                    highlightId={highlightId}
                    setHighlightId={setHighlightId}
                    wavesurfer={wavesurfer}
                    smallTalkCheck={smallTalkCheck}
                    audioTime={audioTime}
                    setAudioTime={setAudioTime}
                    audioReady={audioReady}
                />
                <RightPanel
                    jobLoading={jobLoading}
                    summary={summary}
                    transcript={transcript}
                    highlightId={highlightId}
                    setHighlightId={setHighlightId}
                    wavesurfer={wavesurfer}
                />
            </Grid>
        </ContentLayout>
    );
}
