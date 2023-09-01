import { useState } from 'react';

// Cloudscape
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Grid from '@cloudscape-design/components/grid';
import Select, { SelectProps } from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Textarea from '@cloudscape-design/components/textarea';

// Crunker
import Crunker from 'crunker';
const crunker = new Crunker();

// App
import { AudioLine } from './GenerateAudio';
import { PollyPhrase, getAudioBlobFromPolly } from '../../utils/PollyApi';

const SPEAKERS = [
    { value: 'Salli', label: 'Salli (Female)' },
    { value: 'Kimberly', label: 'Kimberly (Female)' },
    { value: 'Kendra', label: 'Kendra (Female)' },
    { value: 'Joanna', label: 'Joanna (Female)' },
    { value: 'Ruth', label: 'Ruth (Female)' },
    { value: 'Ivy', label: 'Ivy (Female child)' },
    { value: 'Joey', label: 'Joey (Male)' },
    { value: 'Stephen', label: 'Stephen (Male)' },
    { value: 'Kevin', label: 'Kevin (Male child)' },
    { value: 'Justin', label: 'Justin (Male child)' },
];

type AudioLineBoxProps = {
    audioLine: AudioLine;
    validateAudioLine: (audioLine: AudioLine) => boolean;
    updateAudioLineSpeaker: (id: number, selectedOption: SelectProps.Option) => void;
    updateAudioLineText: (id: number, value: string) => void;
    removeAudioLine: (id: number) => void;
};
export default function AudioLineComponent({
    audioLine,
    validateAudioLine,
    updateAudioLineSpeaker,
    updateAudioLineText,
    removeAudioLine,
}: AudioLineBoxProps) {
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [audioBufferNode, setAudioBufferNode] = useState<AudioBufferSourceNode | null>(null);

    async function playOneLine(audioLine: AudioLine) {
        if (!validateAudioLine(audioLine)) return;

        setIsProcessing(true);
        const getAudioInput = {
            voiceId: audioLine.speaker?.value,
            text: audioLine.text,
        };
        const pollyAudioBlob = await getAudioBlobFromPolly(getAudioInput as PollyPhrase);
        const pollyAudioBuffer = await crunker.fetchAudio(pollyAudioBlob);
        setIsProcessing(false);
        setIsPlaying(true);
        const audioElem = crunker.play(pollyAudioBuffer[0]);
        setAudioBufferNode(audioElem);
        audioElem.addEventListener('ended', () => {
            setIsPlaying(false);
        });
    }

    return (
        <Box padding="s">
            <Grid gridDefinition={[{ colspan: 2 }, { colspan: 8 }, { colspan: 2 }]}>
                <Box padding="xxs" margin="xxs">
                    <Select
                        placeholder="Speaker"
                        selectedOption={audioLine.speaker}
                        onChange={({ detail }) => updateAudioLineSpeaker(audioLine.id, detail.selectedOption)}
                        options={SPEAKERS}
                    />
                </Box>
                <Box>
                    <Textarea
                        onChange={({ detail }) => updateAudioLineText(audioLine.id, detail.value)}
                        value={audioLine.text}
                        placeholder="Input text"
                        rows={2}
                        spellcheck={true}
                    />
                </Box>
                <Box padding="xxs" margin="xxxs">
                    <SpaceBetween direction="horizontal" size="s">
                        <Button
                            formAction="none"
                            iconName={isPlaying ? 'close' : 'caret-right-filled'}
                            variant="icon"
                            loading={isProcessing}
                            onClick={() => (isPlaying ? audioBufferNode?.stop() : playOneLine(audioLine))}
                        />
                        <Button
                            formAction="none"
                            iconName="remove"
                            variant="icon"
                            onClick={() => removeAudioLine(audioLine.id)}
                        />
                        <Button formAction="none" iconName="drag-indicator" variant="icon" disabled={true} />
                    </SpaceBetween>
                </Box>
            </Grid>
        </Box>
    );
}
