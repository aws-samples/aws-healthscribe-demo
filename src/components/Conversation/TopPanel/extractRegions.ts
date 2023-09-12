// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Peaks } from 'wavesurfer.js/types/backend';

export const extractRegions = (peaks: Peaks, duration: number) => {
    // Silence params
    const minValue = 0.0015;
    const minSeconds = 0.25;

    const length = peaks.length;
    const coef = duration / length;
    const minLen = minSeconds / coef;

    // Gather silence indeces
    const silences: number[] = [];
    peaks.forEach((val, index) => {
        if (Math.abs(val as number) < minValue) {
            silences.push(index);
        }
    });

    // Cluster silence values
    const clusters: number[][] = [];
    silences.forEach(function (val, index) {
        if (clusters.length && val === silences[index - 1] + 1) {
            clusters[clusters.length - 1].push(val);
        } else {
            clusters.push([val]);
        }
    });

    // Filter silence clusters by minimum length
    const fClusters = clusters.filter((cluster) => cluster.length >= minLen);

    const regions = fClusters.map((cluster) => {
        return {
            start: cluster[0],
            end: cluster[cluster.length - 1],
        };
    });

    // Return time-based regions
    return regions.map((reg: { start: number; end: number }) => {
        return {
            start: Math.round(reg.start * coef * 10) / 10,
            end: Math.round(reg.end * coef * 10) / 10,
        };
    });
};
