import * as AzureStorage from "azure-storage";

export interface TableEntity {
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

  public constructor() {
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

  public async InsertEntities(
    tableName: string,
    entities: TableEntity[],
    insertStrategy: TableInsertStrategy
  ): Promise<AzureStorage.TableService.BatchResult[]> {
    return new Promise(
      (resolve, reject): void => {
        let batch = new AzureStorage.TableBatch();
        {
          entities.forEach(
            (entity): void => {
              batch.addOperation(
                this.insertStrategyToOperationType(insertStrategy),
                this.entityToTableRecord(entity)
              );
            }
          );
        }

        this.tableService.executeBatch(
          tableName,
          batch,
          (
            error: AzureStorage.StorageError,
            batchResults: AzureStorage.TableService.BatchResult[]
            //,response: AzureStorage.ServiceResponse
          ): void => {
            if (error) {
              reject(error);
              return;
            }

            resolve(batchResults);
          }
        );
      }
    );
  }

  public async RetrieveEntity(
    tableName: string,
    partitionKey: string,
    rowKey: string,
    returnNullOnNotFound: boolean = false
  ): Promise<TableEntity> {
    return new Promise<TableEntity>(
      (resolve, reject): void => {
        this.tableService.retrieveEntity<TableEntity>(
          tableName,
          partitionKey,
          rowKey,
          (error: AzureStorage.StorageError, tableRecord: any): void => {
            if (error) {
              if (error.statusCode == 404 && returnNullOnNotFound) {
                resolve(undefined);
              } else {
                reject(error);
              }

              return;
            }

            resolve(this.tableRecordToEntity(tableRecord));
          }
        );
      }
    );
  }

  public async TryRetrieveEntity(
    tableName: string,
    partitionKey: string,
    rowKey: string
  ): Promise<TableEntity> {
    return this.RetrieveEntity(tableName, partitionKey, rowKey, true);
  }

  public async QueryEntities(
    tableName: string,
    query: AzureStorage.TableQuery,
    returnNullOnNotFound: boolean = false
  ): Promise<TableEntity[]> {
    return new Promise<TableEntity[]>(
      (resolve, reject): void => {
        this.tableService.queryEntities<TableEntity>(
          tableName,
          query,
          (null as unknown) as AzureStorage.TableService.TableContinuationToken, // AzureStorage's TypeScript definition is a bit broken
          (
            error: AzureStorage.StorageError,
            result: AzureStorage.TableService.QueryEntitiesResult<TableEntity>
            //,response: AzureStorage.ServiceResponse
          ): void => {
            if (error) {
              if (error.statusCode == 404 && returnNullOnNotFound) {
                resolve(undefined);
              } else {
                reject(error);
              }

              return;
            }

            // FUTURE: Deal with result.continuationToken
            resolve(
              result.entries.map(
                (tableRecord): TableEntity => this.tableRecordToEntity(tableRecord)
              )
            );
          }
        );
      }
    );
  }

  private entityToTableRecord(entity: TableEntity): any {
    let tableRecord: any = {};

    Object.keys(entity).forEach(
      (key): void => {
        const prop = Object.getOwnPropertyDescriptor(entity, key);

        if (prop) {
          tableRecord[key] = new AzureStorage.TableUtilities.entityGenerator.EntityProperty(
            prop.value
          );
        }
      }
    );

    return tableRecord;
  }

  private tableRecordToEntity(tableRecord: any): TableEntity {
    let entity: TableEntity = {};

    Object.keys(tableRecord).forEach(
      (key): void => {
        if (key !== ".metadata") {
          const prop = Object.getOwnPropertyDescriptor(tableRecord, key);
          if (prop) {
            entity[key] = prop.value["_"];
          }
        }
      }
    );

    return entity;
  }
}
