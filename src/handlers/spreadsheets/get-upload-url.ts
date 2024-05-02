import { S3 } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import type {
  APIGatewayProxyEventV2WithRequestContext,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { insertSpreadsheetSchema } from '@/shared/domain/spreadsheet.js';
import { type AuthData, HTTPStatus } from '@/shared/types/index.js';
import {
  createResponse,
  getEnvironmentVariables,
  logger,
} from '@/shared/utils/index.js';

const s3Client = new S3();

export const getUploadURL = async (
  event: APIGatewayProxyEventV2WithRequestContext<{ authorizer: AuthData }>
): Promise<APIGatewayProxyStructuredResultV2> => {
  try {
    const { BUCKET_NAME } = getEnvironmentVariables(
      z.object({ BUCKET_NAME: z.string().min(1) })
    );

    const body = z
      .object({
        displayName: insertSpreadsheetSchema.shape.name,
        fileSize: z
          .number()
          .min(1)
          .max(200 * 1000 * 1000),
      })
      .safeParse(JSON.parse(event.body || '{}'));

    if (!body.success) {
      logger.error({ error: body.error });
      return createResponse({
        statusCode: HTTPStatus.BAD_REQUEST,
        body: body.error.flatten().fieldErrors,
      });
    }

    const key = `to-process/${nanoid()}.csv`;

    const { fields, url } = await createPresignedPost(s3Client, {
      Bucket: BUCKET_NAME,
      Key: key,
      /**
       * The expiration time is set to 10 minutes to avoid the token
       * expiration when the user network is slow.
       */
      Expires: 10 * 60, // 10 minutes,
      Fields: {
        'x-amz-meta-display-name': body.data.displayName,
        'x-amz-meta-owner-id': event.requestContext.authorizer.userId,
        'x-amz-meta-size': body.data.fileSize.toString(),
        'x-amz-meta-type': 'text/csv',
      },
      Conditions: [
        { bucket: BUCKET_NAME },
        { key },
        { 'x-amz-meta-display-name': body.data.displayName },
        { 'x-amz-meta-owner-id': event.requestContext.authorizer.userId },
        { 'x-amz-meta-size': body.data.fileSize.toString() },
        { 'x-amz-meta-type': 'text/csv' },
      ],
    });

    logger.debug({ fields, url });

    return createResponse({
      statusCode: HTTPStatus.CREATED,
      body: {
        data: {
          url,
          fields,
        },
      },
    });
  } catch (error) {
    logger.error({ error });
    return createResponse({
      statusCode: HTTPStatus.INTERNAL_SERVER_ERROR,
      body: {
        error: {
          message: 'Internal server error',
        },
      },
    });
  }
};
