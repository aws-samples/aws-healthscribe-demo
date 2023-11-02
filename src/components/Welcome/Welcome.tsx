// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { memo } from 'react';

// Cloudscape
import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import Container from '@cloudscape-design/components/container';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import TextContent from '@cloudscape-design/components/text-content';

// App
import { useAuthContext } from '../App/contexts';
import { isUserAuth } from '../../utils/Auth';

// Router
import { useNavigate } from 'react-router-dom';

function Welcome() {
    const navigate = useNavigate();
    const { user } = useAuthContext();

    function Content() {
        if (isUserAuth(user)) {
            return (
                <TextContent>
                    <p>This sample ReactJS-based web app shows the art of the possible in using AWS HealthScribe.</p>
                    <p>
                        AWS HealthScribe is a HIPAA-eligible service empowering healthcare software vendors to build
                        clinical applications that automatically generate clinical notes by analyzing patient-clinician
                        conversations.
                    </p>
                    <p>Currently this demo allows you to:</p>
                    <ul>
                        <li>
                            <Link onFollow={() => navigate('/conversations')}>View HealthScribe results</Link>,
                            including:
                        </li>
                        <ul>
                            <li>Summarized clinical notes</li>
                            <li>Rich consultation transcripts</li>
                            <li>Transcript segmentation</li>
                            <li>Evidence mapping</li>
                            <li>Structured medical terms</li>
                        </ul>
                        <li>
                            <Link onFollow={() => navigate('/new')}>
                                Submit your own audio file to AWS HealthScribe.
                            </Link>
                        </li>
                        <li>
                            <Link onFollow={() => navigate('/generate')}>Generate a multi-speaker audio file</Link>{' '}
                            using{' '}
                            <Link external href="https://aws.amazon.com/polly/">
                                Amazon Polly
                            </Link>
                            .
                        </li>
                    </ul>
                </TextContent>
            );
        } else {
            return <Alert>Log in for full functionality.</Alert>;
        }
    }

    function Footer() {
        return (
            <Box textAlign="center" color="text-body-secondary" fontSize="body-s">
                <p>Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.</p>
                <p>
                    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
                    associated documentation files (the &quot;Software&quot;), to deal in the Software without
                    restriction, including without limitation the rights to use, copy, modify, merge, publish,
                    distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
                    Software is furnished to do so.
                </p>
                <p>
                    THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
                    INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
                    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
                    OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
                    CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
                </p>
            </Box>
        );
    }

    return (
        <ContentLayout header={<Header variant="h2">Demo Application Experience powered by AWS HealthScribe</Header>}>
            <Container footer={<Footer />}>
                <Content />
            </Container>
        </ContentLayout>
    );
}

export default memo(Welcome);
