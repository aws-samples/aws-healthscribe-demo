// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useMemo } from 'react';

import Box from '@cloudscape-design/components/box';
import FormField from '@cloudscape-design/components/form-field';
import Grid from '@cloudscape-design/components/grid';
import Input from '@cloudscape-design/components/input';
import Link from '@cloudscape-design/components/link';
import Popover from '@cloudscape-design/components/popover';
import RadioGroup from '@cloudscape-design/components/radio-group';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import TextContent from '@cloudscape-design/components/text-content';

import { MedicalScribeNoteTemplate } from '@aws-sdk/client-transcribe';

import styles from './NewConversation.module.css';
import { AudioDetails, AudioSelection } from './types';

type InputNameProps = {
    jobName: string;
    setJobName: React.Dispatch<React.SetStateAction<string>>;
};
export function InputName({ jobName, setJobName }: InputNameProps) {
    return (
        <FormField
            label="Job name"
            description="The name can be up to 200 characters long. Valid characters are a-z, A-Z, 0-9, . (period), _ (underscore), and – (hyphen)."
        >
            <Input onChange={({ detail }) => setJobName(detail.value)} placeholder="Name" value={jobName} />
        </FormField>
    );
}

type NoteTypeProps = {
    noteType: MedicalScribeNoteTemplate;
    setNoteType: React.Dispatch<React.SetStateAction<MedicalScribeNoteTemplate>>;
};
export function NoteType({ noteType, setNoteType }: NoteTypeProps) {
    const NOTE_TYPES = [
        { label: 'SOAP (Subjective, Objective, Assessment, Plan)', value: 'HISTORY_AND_PHYSICAL' },
        { label: 'GIRPP (Goal, Intervention, Response, Progress, Plan)', value: 'GIRPP' },
    ];

    const selectedOption = useMemo(() => NOTE_TYPES.find((n) => n.value === noteType) || NOTE_TYPES[0], [noteType]);

    return (
        <FormField
            label={
                <SpaceBetween direction="horizontal" size="xs">
                    <div>Note type</div>
                    <Popover
                        header="Introducing GIRPP notes"
                        content={
                            <>
                                AWS HealthScribe now supports GIRPP note template for behavioral health.{' '}
                                <Link
                                    external
                                    href="https://aws.amazon.com/about-aws/whats-new/2025/02/aws-healthscribe-girpp-note-template-behavioral-health/"
                                    variant="primary"
                                >
                                    Learn more
                                </Link>
                            </>
                        }
                    >
                        <StatusIndicator type="info">New</StatusIndicator>
                    </Popover>
                </SpaceBetween>
            }
        >
            <Select
                selectedOption={selectedOption}
                onChange={({ detail }) => setNoteType(detail.selectedOption.value as MedicalScribeNoteTemplate)}
                options={NOTE_TYPES}
            />
        </FormField>
    );
}

type AudioIdentificationTypeProps = {
    audioSelection: AudioSelection;
    setAudioSelection: React.Dispatch<React.SetStateAction<AudioSelection>>;
};
export function AudioIdentificationType({ audioSelection, setAudioSelection }: AudioIdentificationTypeProps) {
    return (
        <FormField
            label="Audio identification"
            description="Choose to split multi-channel audio into separate channels for transcription, or partition speakers in the input audio."
        >
            <div>
                <RadioGroup
                    onChange={({ detail }) => setAudioSelection(detail.value)}
                    value={audioSelection}
                    items={[
                        {
                            value: 'speakerPartitioning',
                            label: 'Speaker partitioning',
                            description:
                                'Use this option if you want to identify multiple speakers in one audio channel.',
                        },
                        {
                            value: 'channelIdentification',
                            label: 'Channel identification',
                            description:
                                'Use this option if you want to identify speakers from audio containing two channels.',
                        },
                    ]}
                />
            </div>
        </FormField>
    );
}

type AudioDetailSettingsProps = {
    audioSelection: AudioSelection;
    audioDetails: AudioDetails;
    setAudioDetails: React.Dispatch<React.SetStateAction<AudioDetails>>;
};
export function AudioDetailSettings({ audioSelection, audioDetails, setAudioDetails }: AudioDetailSettingsProps) {
    if (audioSelection === 'speakerPartitioning') {
        return (
            <FormField
                description="Providing the number of speakers can increase the accuracy of your results."
                label={<TextContent>Maximum number of speakers</TextContent>}
                constraintText="The maximum number of speakers is 10."
                errorText={
                    (audioDetails.speakerPartitioning.maxSpeakers < 2 ||
                        audioDetails.speakerPartitioning.maxSpeakers > 10) &&
                    'Invalid number of speakers.'
                }
            >
                <div className={styles.numberOfSpeakersInput}>
                    <Input
                        onChange={({ detail }) =>
                            setAudioDetails((prevDetails) => {
                                return {
                                    ...prevDetails,
                                    speakerPartitioning: {
                                        maxSpeakers: parseInt(detail.value),
                                    },
                                };
                            })
                        }
                        value={audioDetails.speakerPartitioning.maxSpeakers.toString()}
                        inputMode="numeric"
                        type="number"
                    />
                </div>
            </FormField>
        );
    } else if (audioSelection === 'channelIdentification') {
        return (
            <FormField
                description="Select which persona is on a two channel audio file."
                label={<TextContent>Map channels</TextContent>}
            >
                <Grid gridDefinition={[{ colspan: 3 }, { colspan: 3 }]}>
                    <TextContent>
                        <p>
                            <strong>Channel 1</strong>
                        </p>
                        <RadioGroup
                            onChange={({ detail }) =>
                                setAudioDetails((prevDetails) => {
                                    return {
                                        ...prevDetails,
                                        channelIdentification: {
                                            channel1: detail.value,
                                        },
                                    };
                                })
                            }
                            value={audioDetails.channelIdentification.channel1}
                            items={[
                                {
                                    value: 'CLINICIAN',
                                    label: 'Clinician',
                                },
                                {
                                    value: 'PATIENT',
                                    label: 'Patient',
                                },
                            ]}
                        />
                    </TextContent>
                    <TextContent>
                        <Box textAlign="center">
                            <p>
                                <strong>Channel 2</strong>
                            </p>
                            <p>
                                {audioDetails.channelIdentification.channel1 === 'CLINICIAN' ? 'Patient' : 'Clinician'}
                            </p>
                        </Box>
                    </TextContent>
                </Grid>
            </FormField>
        );
    } else {
        return null;
    }
}
