import * as AzureStorage from "azure-storage";

export interface ITableEntity {
  PartitionKey?: string;
  RowKey?: string;
  [key: string]: string | number | boolean | Date | undefined;
}

export enum TableInsertStrategy {
  Insert,
  InsertOrReplace,
  InsertOrMerge,
  Merge,
  Update,
}

export class AzureTableStorage {
  // https://github.com/Azure/azure-storage-node (newer SDK (azure-storage-js) doesn't support Table storage yet)
  private tableService: AzureStorage.TableService;

  constructor() {
    this.tableService = AzureStorage.createTableService();
  }

  //
  // NOTE: Do not throw on errors inside tableService callbacks - the exception will go uncaught,
  //       bubble to the top, and the world will catch on fire.
  //       reject() the error instead, and remember that reject() does not alter control flow.
  //

  private insertStrategyToOperationType(insertStrategy: TableInsertStrategy): string {
    switch (insertStrategy) {
      case TableInsertStrategy.Insert:
        return AzureStorage.Constants.TableConstants.Operations.INSERT;
      case TableInsertStrategy.InsertOrReplace:
        return AzureStorage.Constants.TableConstants.Operations.INSERT_OR_REPLACE;
      case TableInsertStrategy.InsertOrMerge:
        return AzureStorage.Constants.TableConstants.Operations.INSERT_OR_MERGE;
      case TableInsertStrategy.Merge:
        return AzureStorage.Constants.TableConstants.Operations.MERGE;
      case TableInsertStrategy.Update:
        return AzureStorage.Constants.TableConstants.Operations.UPDATE;
      default:
        throw new Error(`Unexpected insertStrategy ${insertStrategy}`);
    }
  }

  async InsertEntities(
    tableName: string,
    entities: ITableEntity[],
    insertStrategy: TableInsertStrategy
  ): Promise<AzureStorage.TableService.BatchResult[]> {
    return new Promise((resolve, reject) => {
      let batch = new AzureStorage.TableBatch();
      {
        entities.forEach(entity =>
          batch.addOperation(
            this.insertStrategyToOperationType(insertStrategy),
            this.entityToTableRecord(entity)
          )
        );
      }

      this.tableService.executeBatch(
        tableName,
        batch,
        (
          error: AzureStorage.StorageError,
          batchResults: AzureStorage.TableService.BatchResult[],
          response: AzureStorage.ServiceResponse
        ) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(batchResults);
        }
      );
    });
  }

  async RetrieveEntity(
    tableName: string,
    partitionKey: string,
    rowKey: string,
    returnNullOnNotFound: boolean = false
  ): Promise<ITableEntity> {
    return new Promise<ITableEntity>((resolve, reject) => {
      this.tableService.retrieveEntity<ITableEntity>(
        tableName,
        partitionKey,
        rowKey,
        (error, tableRecord) => {
          if (error) {
            if (error["statusCode"] == 404 && returnNullOnNotFound) {
              resolve(null);
            } else {
              reject(error);
            }

            return;
          }

          resolve(this.tableRecordToEntity(tableRecord));
        }
      );
    });
  }

  async TryRetrieveEntity(
    tableName: string,
    partitionKey: string,
    rowKey: string
  ): Promise<ITableEntity> {
    return this.RetrieveEntity(tableName, partitionKey, rowKey, true);
  }

  private entityToTableRecord(entity: ITableEntity): any {
    let tableRecord: any = {};

    Object.keys(entity).forEach(key => {
      const prop = Object.getOwnPropertyDescriptor(entity, key);

      if (prop) {
        tableRecord[key] = new AzureStorage.TableUtilities.entityGenerator.EntityProperty(
          prop.value
        );
      }
    });

    return tableRecord;
  }

  private tableRecordToEntity(tableRecord: any): ITableEntity {
    let entity: any = {};

    Object.keys(tableRecord).forEach(key => {
      if (key !== ".metadata") {
        const prop = Object.getOwnPropertyDescriptor(tableRecord, key);
        if (prop) {
          entity[key] = prop.value["_"];
        }
      }
    });

    return entity;
  }
}
