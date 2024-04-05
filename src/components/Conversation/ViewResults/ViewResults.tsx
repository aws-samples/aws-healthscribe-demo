import React from 'react';
import AceEditor from 'react-ace';

import Container from '@cloudscape-design/components/container';
import Grid from '@cloudscape-design/components/grid';
import Header from '@cloudscape-design/components/header';
import Modal from '@cloudscape-design/components/modal';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-twilight';

import { useAppThemeContext } from '@/store/appTheme';

type ReadOnlyAceEditorProps = {
    appColor: string;
    value: string;
};

function ReadOnlyAceEditor({ appColor, value }: ReadOnlyAceEditorProps) {
    return (
        <AceEditor
            name="transcriptJsonEditor"
            mode="json"
            theme={appColor === 'theme.light' ? 'github' : 'twilight'}
            value={value}
            width="100%"
            wrapEnabled={true}
            readOnly={true}
            tabSize={2}
            setOptions={{ useWorker: false }}
            style={{ borderRadius: '10px' }}
        />
    );
}

type ViewResultsProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    transcriptString: string;
    clinicalDocumentString: string;
};
export default function ViewResults({
    visible,
    setVisible,
    transcriptString,
    clinicalDocumentString,
}: ViewResultsProps) {
    const { appTheme } = useAppThemeContext();

    return (
        <Modal size="max" onDismiss={() => setVisible(false)} visible={visible} header="HealthScribe Results">
            <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                <Container header={<Header variant="h3">Transcript</Header>}>
                    <ReadOnlyAceEditor appColor={appTheme.color} value={transcriptString} />
                </Container>
                <Container header={<Header variant="h3">Clinical Documentation</Header>}>
                    <ReadOnlyAceEditor appColor={appTheme.color} value={clinicalDocumentString} />
                </Container>
            </Grid>
        </Modal>
    );
}
