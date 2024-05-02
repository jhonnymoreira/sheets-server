import { APIGatewayProxyEventV2WithRequestContext } from 'aws-lambda';
import { and, eq } from 'drizzle-orm';
import get from 'lodash.get';
import { z } from 'zod';
import {
  ID_LENGTH,
  contacts,
  contactsBySpreadsheetsCount,
  spreadsheets,
} from '@/db/schema.js';
import { db } from '@/shared/clients/index.js';
import { HTTPStatus } from '@/shared/types/http-status.js';
import { AuthData, Paginated, paginationSchema } from '@/shared/types/index.js';
import { createResponse } from '@/shared/utils/create-response.js';
import { logger } from '@/shared/utils/logger.js';

export const getSpreadsheet = async (
  event: APIGatewayProxyEventV2WithRequestContext<{
    authorizer: AuthData;
  }>
) => {
  try {
    const { pathParameters, queryStringParameters, requestContext } = event;
    const { userId } = requestContext.authorizer;

    const pathParametersValidation = z
      .object({
        id: z.string().trim().length(ID_LENGTH),
      })
      .safeParse(pathParameters);

    if (!pathParametersValidation.success) {
      return createResponse({
        statusCode: HTTPStatus.BAD_REQUEST,
        body: {
          error: {
            message: pathParametersValidation.error.flatten().fieldErrors,
          },
        },
      });
    }

    const paginationValidation = paginationSchema.safeParse(
      queryStringParameters
    );

    if (!paginationValidation.success) {
      return createResponse({
        statusCode: HTTPStatus.BAD_REQUEST,
        body: {
          error: paginationValidation.error.flatten().fieldErrors,
        },
      });
    }

    const { id: spreadsheetId } = pathParametersValidation.data;
    const { itemsPerPage, page: currentPage } = paginationValidation.data;

    const spreadsheetContactsQuery = db
      .select({
        id: contacts.id,
        email: contacts.email,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        createdAt: contacts.createdAt,
      })
      .from(contacts)
      .innerJoin(spreadsheets, eq(spreadsheets.id, contacts.spreadsheetId))
      .where(
        and(
          eq(spreadsheets.ownerId, userId),
          eq(contacts.spreadsheetId, spreadsheetId)
        )
      )
      .limit(itemsPerPage)
      .offset((currentPage - 1) * itemsPerPage);

    const contactsTotalQuery = db
      .select({
        count: contactsBySpreadsheetsCount.count,
      })
      .from(contactsBySpreadsheetsCount)
      .where(eq(contactsBySpreadsheetsCount.spreadsheetId, spreadsheetId))
      .limit(1);

    const [spreadsheetContacts, contactsTotal] = await Promise.all([
      spreadsheetContactsQuery,
      contactsTotalQuery,
    ]);

    const total = get(contactsTotal, '[0].count', 0);
    const lastPage = Math.ceil(total / itemsPerPage);

    return createResponse({
      statusCode: HTTPStatus.OK,
      body: {
        message: {
          data: spreadsheetContacts,
          currentPage,
          itemsPerPage,
          lastPage,
          total,
        } satisfies Paginated<(typeof spreadsheetContacts)[number]>,
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
