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
      Expires: 10 * 60, // 10 minutes,
      Fields: {
        'x-amz-meta-display-name': body.data.displayName,
        'x-amz-meta-size': body.data.fileSize.toString(),
        'x-amz-meta-type': 'text/csv',
        'x-amz-meta-user-email': event.requestContext.authorizer.email,
        'x-amz-meta-user-external-id':
          event.requestContext.authorizer.externalId,
      },
      Conditions: [
        { bucket: BUCKET_NAME },
        { key },
        { 'x-amz-meta-display-name': body.data.displayName },
        { 'x-amz-meta-size': body.data.fileSize.toString() },
        { 'x-amz-meta-type': 'text/csv' },
        { 'x-amz-meta-user-email': event.requestContext.authorizer.email },
        {
          'x-amz-meta-user-external-id':
            event.requestContext.authorizer.externalId,
        },
      ],
    });

    logger.info({ fields, url });

    return createResponse({
      statusCode: HTTPStatus.CREATED,
      body: {
        url,
        fields: Object.fromEntries(
          Object.entries(fields).map(([key, value]) => [
            key.toLowerCase(),
            value,
          ])
        ),
      },
    });
  } catch (error) {
    logger.error({ error });
    return createResponse({
      statusCode: HTTPStatus.INTERNAL_SERVER_ERROR,
      body: {
        message: 'Internal server error',
      },
    });
  }
};
