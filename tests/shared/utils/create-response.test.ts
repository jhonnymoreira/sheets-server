import { HTTPStatus } from '@/shared/types/http-status.js';
import { createResponse } from '@/shared/utils/index.js';

const response = createResponse({
  statusCode: HTTPStatus.OK,
  body: {
    message: 'Hello World',
  },
});

describe('createResponse', () => {
  describe('return fields', () => {
    describe('body', () => {
      describe('when body is a string', () => {
        test('should be a string', () => {
          const { body } = createResponse({
            statusCode: HTTPStatus.OK,
            body: '{"message":"Hello World"}',
          });
          expect(body).toStrictEqual('{"message":"Hello World"}');
        });
      });

      describe('when body is an object', () => {
        test('should be a stringified JSON', () => {
          expect(response.body).toStrictEqual(
            JSON.stringify({ message: 'Hello World' })
          );
        });
      });
    });

    describe('headers', () => {
      test('should have a Content-Type header defaulting to "application/json"', () => {
        expect(response.headers).toHaveProperty(
          'Content-Type',
          'application/json'
        );
      });

      test('should have an Access-Control-Allow-Origin header defaulting to "*"', () => {
        expect(response.headers).toHaveProperty(
          'Access-Control-Allow-Origin',
          '*'
        );
      });

      describe('when headers are provided', () => {
        test('merges the headers', () => {
          const { headers } = createResponse({
            statusCode: HTTPStatus.OK,
            body: {
              message: 'Hello World',
            },
            headers: {
              'X-Custom-Header': 'custom-value',
            },
          });

          expect(headers).toStrictEqual({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'X-Custom-Header': 'custom-value',
          });
        });
      });
    });

    describe('isBase64Encoded', () => {
      test('should be false by default', () => {
        expect(response).toHaveProperty('isBase64Encoded', false);
      });

      test('should be true when isBase64Encoded is true', () => {
        const { isBase64Encoded } = createResponse({
          statusCode: HTTPStatus.OK,
          body: {
            message: 'Hello World',
          },
          isBase64Encoded: true,
        });

        expect(isBase64Encoded).toStrictEqual(true);
      });
    });
  });
});
