// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// Polly SDK
import { PollyClient, SynthesizeSpeechCommand, SynthesizeSpeechCommandInput } from '@aws-sdk/client-polly';

// Amplify-generated
import awsExports from '../../aws-exports';

// Amplify
import { Auth } from 'aws-amplify';

// Use the same region as the Amplify-created S3 bucket
async function getPollyClient() {
    return new PollyClient({
        region: awsExports?.aws_user_files_s3_bucket_region || 'us-east-1',
        credentials: await Auth.currentCredentials(),
    });
}

export type PollyPhrase = {
    voiceId: 'Salli' | 'Kimberly' | 'Kendra' | 'Joanna' | 'Ruth' | 'Ivy' | 'Joey' | 'Stephen' | 'Kevin' | 'Justin';
    text: string;
};

type GetAudioFromPollyProps = PollyPhrase;

/**
 * @description Return an unsigned array Blob from Polly
 * @param {PollyPhrase} voiceId - VoiceId to use for Polly
 * @param {string} text - Text to use for Polly
 */
export async function getAudioBlobFromPolly({ voiceId, text }: GetAudioFromPollyProps) {
    const pollyClient = await getPollyClient();
    const pollySynthesizeSpeechInput: SynthesizeSpeechCommandInput = {
        Engine: 'neural',
        LanguageCode: 'en-US',
        OutputFormat: 'mp3',
        SampleRate: '16000',
        Text: text,
        TextType: 'text',
        VoiceId: voiceId,
    };
    const pollySynthesizeSpeechCmd = new SynthesizeSpeechCommand(pollySynthesizeSpeechInput);
    const pollySynthesizeSpeechRsp = await pollyClient.send(pollySynthesizeSpeechCmd);
    const pollyByteArray = await pollySynthesizeSpeechRsp.AudioStream?.transformToByteArray();
    return new Blob([pollyByteArray as Uint8Array]);
}
