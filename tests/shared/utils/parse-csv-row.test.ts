import { parseCsvRow } from '@/shared/utils/index.js';

const csvRow = ['john@example.com', 'John', 'Doe'];
const csvRowWithLastnameMissing = ['john@example.com', 'John', ''];
const csvRowWithInvalidData = ['invalid-email', 'John', 'Doe'];
const csvRowWithInvalidSize = ['john@example.com', 'John', 'Doe', 'Jane'];

describe('parseCsvRow', () => {
  test('should return a StructuredContact', () => {
    const structuredContact = parseCsvRow(csvRow);

    expect(structuredContact).toMatchInlineSnapshot(`
      {
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe",
      }
    `);
  });

  describe('validations', () => {
    describe('when the data length is greater than the CSV row length', () => {
      test('should return undefined', () => {
        const structuredContact = parseCsvRow(csvRowWithInvalidSize);

        expect(structuredContact).toBeUndefined();
      });
    });

    describe('when invalid data is provided', () => {
      test('should return undefined', () => {
        const structuredContact = parseCsvRow(csvRowWithInvalidData);

        expect(structuredContact).toBeUndefined();
      });
    });

    describe('when "lastName" is missing', () => {
      test('should return a StructuredContact without the lastName', () => {
        const structuredContact = parseCsvRow(csvRowWithLastnameMissing);

        expect(structuredContact).toMatchInlineSnapshot(`
          {
            "email": "john@example.com",
            "firstName": "John",
          }
        `);
      });
    });
  });
});
