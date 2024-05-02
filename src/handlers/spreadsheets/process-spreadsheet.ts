import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { S3Event, S3EventRecord, SQSEvent } from 'aws-lambda';
import get from 'lodash.get';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { spreadsheets, users } from '@/db/schema.js';
import { db } from '@/shared/clients/drizzle.js';
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
      email: get(Metadata, 'user-email', ''),
      externalId: get(Metadata, 'user-external-id', ''),
    },
    z.object({
      displayName: z.string().min(1).max(64),
      email: z.string().trim().min(1),
      externalId: z.string().trim().min(1),
    })
  );

  /**
   * Workaround to keep the users table in sync with the auth provider.
   */
  const [user] = await db
    .insert(users)
    .values({
      externalId: parsedMetadata.externalId,
      email: parsedMetadata.email,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        externalId: parsedMetadata.externalId,
        email: parsedMetadata.email,
      },
    })
    .returning({
      id: users.id,
      externalId: users.externalId,
    });

  if (!user) {
    logger.error('Unable to get user', { parsedMetadata });
    return;
  }

  logger.debug({ user });

  const csvContent = await Body.transformToString('utf-8');
  const contacts = await processContactsCSV(csvContent);

  const objectKey = object.key.replace('to-process/', '').replace('.csv', '');
  logger.debug({ objectKey });
  const [spreadsheet] = await db
    .insert(spreadsheets)
    .values({
      key: objectKey,
      name: parsedMetadata.displayName,
      ownerId: user.id,
    })
    .returning({
      id: spreadsheets.id,
    })
    .onConflictDoNothing({ target: spreadsheets.key });

  if (!spreadsheet) {
    logger.error('Unable to get spreadsheet', { parsedMetadata, user });
    return;
  }

  logger.debug({ spreadsheet });

  const dataBatches = prepareDataBatches(
    contacts,
    {
      ownerId: user.id,
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
