import chunk from 'lodash.chunk';

type PreparaDataOwnershipProps = {
  ownerId: string;
  spreadsheetId: string;
};

type PreparaDataBatchesBuilderProps = {
  chunkSize: number;
};

export const prepareDataBatches = (
  data: unknown[],
  { ownerId, spreadsheetId }: PreparaDataOwnershipProps,
  { chunkSize }: PreparaDataBatchesBuilderProps
) => {
  if (chunkSize <= 0) {
    throw new Error('chunkSize must be greater than 0');
  }

  return chunk(data, chunkSize).map((batchData) =>
    JSON.stringify({
      data: batchData,
      spreadsheetId,
      ownerId,
    })
  );
};
