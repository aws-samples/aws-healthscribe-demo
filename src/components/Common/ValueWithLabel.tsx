import React from 'react';

import Box from '@cloudscape-design/components/box';

type ValueWithLabelProps = {
    label: string;
    children: string | React.ReactNode;
};
export default function ValueWithLabel({ label, children }: ValueWithLabelProps) {
    return (
        <div>
            <Box variant="awsui-key-label">{label}</Box>
            <div>{children}</div>
        </div>
    );
}
