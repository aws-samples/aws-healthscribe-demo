// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Peaks } from 'wavesurfer.js/types/backend';

export const extractRegions = (peaks: Peaks, duration: number) => {
    // Silence params
    const minValue = 0.0001;
    const minSeconds = 1;

    const length = peaks.length;
    const coef = duration / length;
    const minLen = minSeconds / coef;

    // Gather silence indeces
    const silences: number[] = [];

    Array.prototype.forEach.call(peaks, (val, index) => {
        if (Math.abs(val) > minValue) {
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

    // Create regions on the edges of silences
    const regions = fClusters.map((cluster, index) => {
        const next = fClusters[index + 1];
        return {
            start: cluster[cluster.length - 1],
            end: next ? next[0] : length - 1,
        };
    });

    // Add an initial region if the audio doesn't start with silence
    const firstCluster = fClusters[0];
    if (firstCluster && firstCluster[0] !== 0) {
        regions.unshift({
            start: 0,
            end: firstCluster[firstCluster.length - 1],
        });
    }

    // Filter regions by minimum length
    const fRegions = regions.filter((reg: { end: number; start: number }) => {
        return reg.end - reg.start >= minLen;
    });

    // Return time-based regions
    return fRegions.map((reg: { start: number; end: number }) => {
        return {
            start: Math.round(reg.start * coef * 10) / 10,
            end: Math.round(reg.end * coef * 10) / 10,
        };
    });
};
