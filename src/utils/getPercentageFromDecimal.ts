// Return a percentage with 2 decimal points from a 0.x decimal
export default function getPercentageFromDecimal(decimal: number | undefined) {
    if (typeof decimal === 'undefined') return 'n/a';
    return `${(decimal * 100).toFixed(2)}%`;
}
