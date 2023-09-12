// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useContext, useEffect, useState } from 'react';

// Cloudscape
import ContentLayout from '@cloudscape-design/components/content-layout';
import Grid from '@cloudscape-design/components/grid';

// Router
import { useParams } from 'react-router-dom';

// API
import { getHealthScribeJob } from '../../utils/HealthScribeApi';

// App
import { useAudio } from '../../hooks/useAudio';
import { HealthScribeJob } from './types';
import { NotificationContext } from '../App/contexts';
import { IAuraClinicalDocOutput, IAuraTranscriptOutput } from '../../types/HealthScribe';
import { getObject, getS3Object } from '../../utils/S3Api';
import TopPanel from './TopPanel';
import RightPanel from './RightPanel';
import LeftPanel from './LeftPanel';
import ViewResults from './ViewResults';

export default function Conversation() {
    const { conversationName } = useParams();
    const { addFlashMessage } = useContext(NotificationContext);

    const [jobLoading, setJobLoading] = useState(true); // Is getHealthScribeJob in progress
    const [jobDetails, setJobDetails] = useState<HealthScribeJob | null>(null); // HealthScribe job details
    const [viewResultsModal, setViewResultsModal] = useState<boolean>(false); // Is view results modal open

    const [clinicalDocument, setClinicalDocument] = useState<IAuraClinicalDocOutput | null>(null);
    const [transcriptFile, setTranscriptFile] = useState<IAuraTranscriptOutput | null>(null);

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
                const MedicalScribeJob = getHealthScribeJobRsp.data?.MedicalScribeJob;
                if (Object.keys(MedicalScribeJob).length > 0) {
                    setJobDetails(MedicalScribeJob);
                } else {
                    throw new Error(`HealthScribe job name ${conversationName} not found`);
                }

                // Get Clinical Document from result S3 URL
                const clinicalDocumentUri = MedicalScribeJob.MedicalScribeOutput?.ClinicalDocumentUri;
                const clinicalDocumentRsp = await getObject(getS3Object(clinicalDocumentUri));
                setClinicalDocument(JSON.parse((await clinicalDocumentRsp?.Body?.transformToString()) || ''));

                // Get Transcript File from result S3 URL
                const transcriptFileUri = MedicalScribeJob.MedicalScribeOutput?.TranscriptFileUri;
                const transcriptFileRsp = await getObject(getS3Object(transcriptFileUri));
                setTranscriptFile(JSON.parse((await transcriptFileRsp?.Body?.transformToString()) || ''));
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
            getJob(conversationName);
        }
    }, []);

    return (
        <ContentLayout>
            <ViewResults
                visible={viewResultsModal}
                setVisible={setViewResultsModal}
                transcriptString={JSON.stringify(transcriptFile || 'Loading...', null, 2)}
                clinicalDocumentString={JSON.stringify(clinicalDocument || 'Loading...', null, 2)}
            />
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
                    transcriptFile={transcriptFile}
                    wavesurfer={wavesurfer}
                    smallTalkCheck={smallTalkCheck}
                    setSmallTalkCheck={setSmallTalkCheck}
                    setAudioTime={setAudioTime}
                    setAudioReady={setAudioReady}
                    setViewResultsModal={setViewResultsModal}
                />
                <LeftPanel
                    jobLoading={jobLoading}
                    transcriptFile={transcriptFile}
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
                    clinicalDocument={clinicalDocument}
                    transcriptFile={transcriptFile}
                    highlightId={highlightId}
                    setHighlightId={setHighlightId}
                    wavesurfer={wavesurfer}
                />
            </Grid>
        </ContentLayout>
    );
}
