import { prepareDataBatches } from '@/shared/utils/index.js';

vitest.mock('nanoid', () => ({
  nanoid: vi.fn().mockReturnValue('39Bq9TikRI'),
}));

const data = Array.from({ length: 10 }, (_, i) => i + 1);
const ownerId = 'yl7n8oP5arfgGV45pNeRk';
const spreadsheetId = 'DdEcN1yKFoBHVe5QT_YJ-';

const ownership = {
  ownerId,
  spreadsheetId,
};
/**
 * Mocks the `nanoid` function to return a fixed value for each call.
 * The field "batchId" is used to identify each batch and it is
 * randomized.
 */
describe('prepareDataBatches', () => {
  test('returns an array of stringified chunks of data with embdded ownership data (spreadsheetId and ownerId)', () => {
    const batches = prepareDataBatches(data, ownership, {
      chunkSize: 7,
    });

    expect(batches).toMatchInlineSnapshot(`
      [
        "{"data":[1,2,3,4,5,6,7],"spreadsheetId":"DdEcN1yKFoBHVe5QT_YJ-","ownerId":"yl7n8oP5arfgGV45pNeRk"}",
        "{"data":[8,9,10],"spreadsheetId":"DdEcN1yKFoBHVe5QT_YJ-","ownerId":"yl7n8oP5arfgGV45pNeRk"}",
      ]
    `);
  });

  describe('props', () => {
    describe('chunkSize', () => {
      test('controls the maximum data length of each batch', () => {
        const batches = prepareDataBatches(data, ownership, { chunkSize: 2 });

        return expect(batches).toMatchInlineSnapshot(`
          [
            "{"data":[1,2],"spreadsheetId":"DdEcN1yKFoBHVe5QT_YJ-","ownerId":"yl7n8oP5arfgGV45pNeRk"}",
            "{"data":[3,4],"spreadsheetId":"DdEcN1yKFoBHVe5QT_YJ-","ownerId":"yl7n8oP5arfgGV45pNeRk"}",
            "{"data":[5,6],"spreadsheetId":"DdEcN1yKFoBHVe5QT_YJ-","ownerId":"yl7n8oP5arfgGV45pNeRk"}",
            "{"data":[7,8],"spreadsheetId":"DdEcN1yKFoBHVe5QT_YJ-","ownerId":"yl7n8oP5arfgGV45pNeRk"}",
            "{"data":[9,10],"spreadsheetId":"DdEcN1yKFoBHVe5QT_YJ-","ownerId":"yl7n8oP5arfgGV45pNeRk"}",
          ]
        `);
      });

      describe('when less than or equal to 0', () => {
        test('throws an error', () => {
          expect.assertions(1);

          try {
            prepareDataBatches(data, ownership, { chunkSize: -1 });
          } catch (error) {
            expect(error).toMatchInlineSnapshot(
              `[Error: chunkSize must be greater than 0]`
            );
          }
        });
      });

      describe('when the chunk size is greater than the data length', () => {
        test('returns an array with a single chunk', () => {
          const batches = prepareDataBatches(data, ownership, {
            chunkSize: 100,
          });

          return expect(batches).toMatchInlineSnapshot(`
            [
              "{"data":[1,2,3,4,5,6,7,8,9,10],"spreadsheetId":"DdEcN1yKFoBHVe5QT_YJ-","ownerId":"yl7n8oP5arfgGV45pNeRk"}",
            ]
          `);
        });
      });
    });
  });
});
