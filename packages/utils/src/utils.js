import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

import { REGION, IDENTITY_POOL_ID } from "./config.js";

export const getResponse = async (clientParams) => {
  const client = new S3Client({
    ...clientParams,
    // Uncomment this to skip checksum validation
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  const result = await client.send(
    new GetObjectCommand({
      Bucket: "s3-compression-checksum-reproduction",
      Key: "uncompressed.txt.br",
    })
  );

  // This line is needed since this consumes the Body readable stream. Without consuming that, we never do
  // checksum validation on the Body.
  const stream = await result.Body.transformToWebStream();
  return new Response(stream);
};

export const getBrowserResponse = async () =>
  getResponse({
    region: REGION,
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({
        region: REGION,
      }),
      identityPoolId: IDENTITY_POOL_ID,
    }),
  });
