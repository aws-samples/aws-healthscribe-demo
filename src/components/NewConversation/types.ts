export type AudioSelection = string;

export type AudioDetails = {
    speakerPartitioning: {
        maxSpeakers: number; // MaxSpeakerLabels
    };
    channelIdentification: {
        channel1: string;
    };
};
