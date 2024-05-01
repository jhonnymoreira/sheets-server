import { parse } from 'csv-parse';
import { type StructuredContact } from '@/shared/types/index.js';
import { parseCsvRow } from '@/shared/utils/index.js';

export const processContactsCSV = async (csvContent: string) => {
  const parsedCsv = new Map<string, StructuredContact>();

  const parser = parse(csvContent, {
    bom: true,
    encoding: 'utf-8',
    skipEmptyLines: true,
    trim: true,
    onRecord: (record) => parseCsvRow(record),
  });

  for await (const row of parser) {
    const structuredContact = row as StructuredContact;
    parsedCsv.set(structuredContact.email, structuredContact);
  }

  return Array.from(parsedCsv.values());
};
