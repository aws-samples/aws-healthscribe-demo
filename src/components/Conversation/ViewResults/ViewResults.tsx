import { useState, useEffect } from 'react';

// Cloudscape
import Container from '@cloudscape-design/components/container';
import Modal from '@cloudscape-design/components/modal';
import Header from '@cloudscape-design/components/header';
import Grid from '@cloudscape-design/components/grid';

// App
import { useAppContext } from '../../App';

// Ace Editor
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-twilight';

type ReadOnlyAceEditorProps = {
    appTheme: string;
    value: string;
};
function ReadOnlyAceEditor({ appTheme, value }: ReadOnlyAceEditorProps) {
    return (
        <AceEditor
            name="transcriptJsonEditor"
            mode="json"
            theme={appTheme === 'theme.light' ? 'github' : 'twilight'}
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
    // eslint-disable-next-line no-unused-vars
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
    const { appTheme } = useAppContext();

    return (
        <Modal size="max" onDismiss={() => setVisible(false)} visible={visible} header="HealthScribe Results">
            <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                <Container header={<Header variant="h3">Transcript</Header>}>
                    <ReadOnlyAceEditor appTheme={appTheme} value={transcriptString} />
                </Container>
                <Container header={<Header variant="h3">Clinical Documentation</Header>}>
                    <ReadOnlyAceEditor appTheme={appTheme} value={clinicalDocumentString} />
                </Container>
            </Grid>
        </Modal>
    );
}
