/**
 * Flatten and unique an array of arrays
 * @param arr
 * @returns arr
 */
export function flattenAndUnique(arr: number[][]) {
    // Use the flat() method to flatten the array
    const flattenedArr = arr.flat();
    // Use the Set data structure to get unique values
    const uniqueValues = new Set(flattenedArr);
    // Convert and return the Set back to an array
    return Array.from(uniqueValues);
}
