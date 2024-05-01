import { HTTPStatus } from '@/shared/types/http-status.js';
import { createResponse } from '@/shared/utils/create-response.js';

export const getSpreadsheet = () => {
  return createResponse({
    statusCode: HTTPStatus.OK,
    body: {
      message: 'Spreadsheet',
    },
  });
};
