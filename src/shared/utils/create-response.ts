import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

type CreateResponse = (props: {
  statusCode: number;
  body: Record<string, unknown> | string;
  isBase64Encoded?: boolean;
  headers?: APIGatewayProxyStructuredResultV2['headers'];
}) => APIGatewayProxyStructuredResultV2;

const DEFAULT_HEADERS: APIGatewayProxyStructuredResultV2['headers'] = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export const createResponse: CreateResponse = ({
  statusCode,
  body,
  isBase64Encoded = false,
  headers = DEFAULT_HEADERS,
}) => ({
  statusCode,
  body: typeof body === 'string' ? body : JSON.stringify(body),
  isBase64Encoded,
  headers: { ...DEFAULT_HEADERS, ...headers },
});
