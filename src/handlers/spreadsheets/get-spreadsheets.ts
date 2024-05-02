import {
  APIGatewayProxyEventV2WithRequestContext,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { eq } from 'drizzle-orm';
import { spreadsheets } from '@/db/schema.js';
import { db } from '@/shared/clients/index.js';
import { AuthData, HTTPStatus } from '@/shared/types/index.js';
import { createResponse, logger } from '@/shared/utils/index.js';

export const getSpreadsheets = async (
  event: APIGatewayProxyEventV2WithRequestContext<{ authorizer: AuthData }>
): Promise<APIGatewayProxyStructuredResultV2> => {
  const { authorizer } = event.requestContext;
  const { userId } = authorizer;

  try {
    const spreadsheetsData = await db
      .select({
        id: spreadsheets.id,
        name: spreadsheets.name,
        createdAt: spreadsheets.createdAt,
      })
      .from(spreadsheets)
      .where(eq(spreadsheets.ownerId, userId));

    return createResponse({
      statusCode: HTTPStatus.OK,
      body: {
        spreadsheets: spreadsheetsData,
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
