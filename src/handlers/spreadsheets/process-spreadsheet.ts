import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { S3Event, S3EventRecord, SQSEvent } from 'aws-lambda';
import get from 'lodash.get';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { ID_LENGTH, spreadsheets } from '@/db/schema.js';
import { db } from '@/shared/clients/index.js';
import {
  getEnvironmentVariables,
  logger,
  parseS3ObjectMetadata,
  prepareDataBatches,
  processContactsCSV,
} from '@/shared/utils/index.js';

const s3Client = new S3Client();
const sqsClient = new SQSClient();

export const processSpreadsheet = async (event: SQSEvent) => {
  /**
   * Since the event `batchSize` was configured to 1, it is safe to
   * assume that the event is a single message.
   */
  const s3Event = JSON.parse(get(event, 'Records[0].body', '{}')) as S3Event;
  const s3Record = get(s3Event, 'Records[0]', {}) as S3EventRecord;

  /**
   * Workaround to avoid testing events from S3 to cause errors.
   */
  const isS3Event = get(s3Record, 'eventName', '') === 'ObjectCreated:Post';

  if (!isS3Event) {
    logger.error('S3 event not found', { event });
    return;
  }

  const { PROCESSED_CONTACTS_QUEUE_URL } = getEnvironmentVariables(
    z.object({
      PROCESSED_CONTACTS_QUEUE_URL: z.string().trim().min(1),
    })
  );

  const { bucket, object } = s3Record.s3;
  const getObjectCommand = new GetObjectCommand({
    Bucket: bucket.name,
    Key: object.key,
  });

  const { Body, Metadata } = await s3Client.send(getObjectCommand);

  if (!Body || !Metadata) {
    logger.error('Unable to fetch S3 object', { s3Record });
    return;
  }

  console.log({ Metadata });

  const parsedMetadata = parseS3ObjectMetadata(
    {
      displayName: get(Metadata, 'display-name', ''),
      ownerId: get(Metadata, 'owner-id', ''),
    },
    z.object({
      displayName: z.string().min(1).max(64),
      ownerId: z.string().trim().length(ID_LENGTH),
    })
  );

  const csvContent = await Body.transformToString('utf-8');
  const contacts = await processContactsCSV(csvContent);

  const objectKey = object.key.replace('to-process/', '').replace('.csv', '');
  logger.debug({ objectKey });

  const [spreadsheet] = await db
    .insert(spreadsheets)
    .values({
      key: objectKey,
      name: parsedMetadata.displayName,
      ownerId: parsedMetadata.ownerId,
    })
    .returning({
      id: spreadsheets.id,
    })
    .onConflictDoNothing({ target: spreadsheets.key });

  if (!spreadsheet) {
    logger.error('Unable to get spreadsheet', { parsedMetadata });
    return;
  }
  logger.debug({ spreadsheet });

  const dataBatches = prepareDataBatches(
    contacts,
    {
      ownerId: parsedMetadata.ownerId,
      spreadsheetId: spreadsheet.id,
    },
    {
      chunkSize: 500,
    }
  );

  const batchesSent = await Promise.allSettled(
    dataBatches.map(async (data) => {
      const sendMessageCommand = new SendMessageCommand({
        QueueUrl: PROCESSED_CONTACTS_QUEUE_URL,
        MessageBody: data,
        MessageDeduplicationId: nanoid(),
        MessageGroupId: spreadsheet.id,
      });

      await sqsClient.send(sendMessageCommand);
    })
  );

  const failedBatches = batchesSent.filter(
    ({ status }) => status === 'rejected'
  ).length;

  logger.info({
    successfulBatches: batchesSent.length - failedBatches,
    failedBatches,
  });
};
