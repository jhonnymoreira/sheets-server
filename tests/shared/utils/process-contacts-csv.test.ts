import { processContactsCSV } from '@/shared/utils/index.js';

describe('processContactsCSV', () => {
  test('should return an array of StructuredContacts', async () => {
    const csvContent = `
email,firstName,lastName
john@example.com,John,Doe
jane@example.com,Jane,Doe`.trim();
    const structuredContacts = await processContactsCSV(csvContent);

    expect(structuredContacts).toMatchInlineSnapshot(`
      [
        {
          "email": "john@example.com",
          "firstName": "John",
          "lastName": "Doe",
        },
        {
          "email": "jane@example.com",
          "firstName": "Jane",
          "lastName": "Doe",
        },
      ]
    `);
  });

  describe('when the CSV has "lastName" missing', () => {
    test('removes "lastName" from the row and returns an array of StructuredContactse', async () => {
      const csvContent = `
email,firstName,lastName
john@example.com,John,Doe
jane@example.com,Jane,Doe
another@example.com,Another,`.trim();

      const structuredContacts = await processContactsCSV(csvContent);

      expect(structuredContacts).toMatchInlineSnapshot(`
        [
          {
            "email": "john@example.com",
            "firstName": "John",
            "lastName": "Doe",
          },
          {
            "email": "jane@example.com",
            "firstName": "Jane",
            "lastName": "Doe",
          },
          {
            "email": "another@example.com",
            "firstName": "Another",
          },
        ]
      `);
    });
  });

  describe('when the CSV contains duplicated emails', () => {
    test('prioritizes the last occurrence and returns an array of StructuredContacts', async () => {
      const csvContent = `
email,firstName,lastName
john@example.com,John,Doe
john@example.com,John,
jane@example.com,Jane,Doe`.trim();

      const structuredContacts = await processContactsCSV(csvContent);

      expect(structuredContacts).toMatchInlineSnapshot(`
      [
        {
          "email": "john@example.com",
          "firstName": "John",
        },
        {
          "email": "jane@example.com",
          "firstName": "Jane",
          "lastName": "Doe",
        },
      ]
    `);
    });
  });

  describe('when the CSV contains newlines between the rows', () => {
    test('skip the newlines and returns an array of StructuredContacts', async () => {
      const csvContent = `
email,firstName,lastName

john@example.com,John,Doe

jane@example.com,Jane,Doe

another@example.com,Another,
`.trim();
      const structuredContacts = await processContactsCSV(csvContent);

      expect(structuredContacts).toMatchInlineSnapshot(`
      [
        {
          "email": "john@example.com",
          "firstName": "John",
          "lastName": "Doe",
        },
        {
          "email": "jane@example.com",
          "firstName": "Jane",
          "lastName": "Doe",
        },
        {
          "email": "another@example.com",
          "firstName": "Another",
        },
      ]
    `);
    });
  });

  describe('when the CSV contains more row fields than the title', () => {
    test('should throw an error', async () => {
      expect.assertions(1);
      const csvContent = `
email,firstName,
john@example.com,John,extraValue
jane@example.com,Jane`.trim();

      try {
        await processContactsCSV(csvContent);
      } catch (error) {
        expect(error).toMatchInlineSnapshot(
          `[Error: Invalid Record Length: expect 3, got 2 on line 3]`
        );
      }
    });
  });
});
