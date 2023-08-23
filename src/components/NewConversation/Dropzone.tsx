// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { memo, useEffect } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';

import styles from './Dropzone.module.css';

// Validate dropped files
function validateFile(f: FileWithPath) {
    if (!f.type.startsWith('audio/')) {
        return {
            code: 'invalid-file-type',
            message: `File signature is not an audio file (${f.type}).`,
        };
    } else if (f.size > 2147483648) {
        return {
            code: 'invalid-file-size',
            message: `File size exceeds the maximum of 2GB (${f.size} bytes).`,
        };
    } else {
        return null;
    }
}

type AudioDropZoneProps = {
    setFilePath: React.Dispatch<React.SetStateAction<File | undefined>>;
    setFormError: React.Dispatch<React.SetStateAction<string | JSX.Element[]>>;
};

export const AudioDropzone = memo(function AudioDropzone({ setFilePath, setFormError }: AudioDropZoneProps) {
    const { acceptedFiles, fileRejections, getRootProps, getInputProps } = useDropzone({
        multiple: false,
        validator: validateFile,
    });

    useEffect(() => {
        if (acceptedFiles.length > 0) {
            setFilePath(acceptedFiles[0]);
        } else {
            setFilePath(undefined);
        }

        if (fileRejections.length > 0) {
            const rejectionMessages = fileRejections.map(
                ({ file, errors }) => `File ${file.name} rejected: ${errors[0].message}`
            );
            if (rejectionMessages.length > 0) {
                setFormError(rejectionMessages.map((m, i) => <p key={i}>{m}</p>));
            } else {
                setFormError(rejectionMessages[0]);
            }
        } else {
            setFormError('');
        }
    }, [acceptedFiles, fileRejections]);

    return (
        <div className={styles.dropzoneContainer}>
            <div
                {...getRootProps({
                    className: `${styles.dropzone} ${acceptedFiles.length > 0 && styles.dropzoneShorter}`,
                })}
            >
                <input {...getInputProps()} />
                <p>Drag n drop an audio file here, or click to select an audio file.</p>
                <p>Only one audio file will be accepted.</p>
                <em>Valid formats: MP3, MP4, WAV, FLAC, AMR, OGG, and WebM</em>
            </div>
        </div>
    );
});
