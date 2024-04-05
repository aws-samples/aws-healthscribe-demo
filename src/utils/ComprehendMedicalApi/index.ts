import {
    ComprehendMedicalClient,
    InferICD10CMCommand,
    InferRxNormCommand,
    InferSNOMEDCTCommand,
} from '@aws-sdk/client-comprehendmedical';

import { getConfigRegion, getCredentials } from '@/utils/Sdk';

// Use the same region as the Amplify-created S3 bucket
async function getComprehendMedicalClient() {
    return new ComprehendMedicalClient({
        region: getConfigRegion(),
        credentials: await getCredentials(),
    });
}

/**
 * @description Return inferred ICD-10-CM data from Comprehend Medical
 * @param {string} text
 */
async function getIcd10FromComprehendMedical(text: string) {
    const cmClient = await getComprehendMedicalClient();
    const cmInput = {
        Text: text,
    };
    const cmCmd = new InferICD10CMCommand(cmInput);
    return await cmClient.send(cmCmd);
}

/**
 * @description Return inferred RxNorm data from Comprehend Medical
 * @param {string} text
 */
async function getRxNormFromComprehendMedical(text: string) {
    const cmClient = await getComprehendMedicalClient();
    const cmInput = {
        Text: text,
    };
    const cmCmd = new InferRxNormCommand(cmInput);
    return await cmClient.send(cmCmd);
}

/**
 * @description Return inferred SNOMED-CT data from Comprehend Medical
 * @param {string} text
 */
async function getSnomedCtFromComprehendMedical(text: string) {
    const cmClient = await getComprehendMedicalClient();
    const cmInput = {
        Text: text,
    };
    const cmCmd = new InferSNOMEDCTCommand(cmInput);
    return await cmClient.send(cmCmd);
}

/**
 * @description Return inferred data from Comprehend Medical
 * @param {string} ontology icd10cm, rxnorm, snomedct
 * @param {string} text
 */
export async function getInferredData(ontology: string, text: string) {
    switch (ontology) {
        case 'icd10cm':
            return await getIcd10FromComprehendMedical(text);
        case 'rxnorm':
            return await getRxNormFromComprehendMedical(text);
        case 'snomedct':
            return await getSnomedCtFromComprehendMedical(text);
        default:
            return false;
    }
}
