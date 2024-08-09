// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';

import Box from '@cloudscape-design/components/box';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import SpaceBetween from '@cloudscape-design/components/space-between';
import TextContent from '@cloudscape-design/components/text-content';

export function Overview() {
    return (
        <SpaceBetween size={'s'}>
            <Header variant="h2">Overview</Header>
            <Container>
                <SpaceBetween size={'s'}>
                    <TextContent>
                        <Box variant="p">
                            This sample ReactJS-based web app shows the art of the possible in using AWS HealthScribe.
                        </Box>
                        <Box variant="p">
                            AWS HealthScribe is a HIPAA-eligible service empowering healthcare software vendors to build
                            clinical applications that automatically generate clinical notes by analyzing
                            patient-clinician conversations.
                        </Box>
                    </TextContent>
                </SpaceBetween>
            </Container>
        </SpaceBetween>
    );
}

export function Highlights() {
    return (
        <SpaceBetween size={'s'}>
            <Header variant="h2">Highlights</Header>
            <Container>
                <ul>
                    <li>Submit an audio file for AWS HealthScribe.</li>
                    <li>View AWS HealthScribe results.</li>
                    <li>Record or generate audio.</li>
                    <li>Integration with Amazon Comprehend Medical.</li>
                </ul>
            </Container>
        </SpaceBetween>
    );
}

export function Details() {
    return (
        <SpaceBetween size={'s'}>
            <Header variant="h2">
                <span>Details</span>
            </Header>
            <Container>
                <SpaceBetween size={'s'}>
                    <Box>
                        <b>View HealthScribe results</b>, including:
                        <ul>
                            <li>Summarized clinical notes</li>
                            <li>Rich consultation transcripts</li>
                            <li>Transcript segmentation</li>
                            <li>Evidence mapping</li>
                            <li>Structured medical terms</li>
                        </ul>
                    </Box>
                    <Box>
                        <b>
                            Integrate AWS HealthScribe with{' '}
                            <Link external href="https://aws.amazon.com/comprehend/medical/">
                                Amazon Comprehend Medical
                            </Link>
                        </b>
                        , allowing you to:
                        <ul>
                            <li>
                                Infer medical ontologies (RxNorm, ICD-10-CM, and SNOMED CT) from the HealthScribe
                                trancript
                            </li>
                            <li>
                                Detect medical terminologies and infer medical ontologies from the HealthScribe insights
                                output
                            </li>
                        </ul>
                    </Box>
                </SpaceBetween>
            </Container>
        </SpaceBetween>
    );
}

export function Footer() {
    return (
        <Container>
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
        </Container>
    );
}
