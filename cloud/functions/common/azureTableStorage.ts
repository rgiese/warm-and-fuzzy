import * as AzureStorage from "azure-storage";

export interface ITableEntity {
  PartitionKey?: string;
  RowKey?: string;
  [key: string]: string | number | boolean | undefined;
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

  async AddOrMergeEntity(tableName: string, entity: ITableEntity): Promise<ITableEntity> {
    return new Promise((resolve, reject) => {
      const tableRecord = this.entityToTableRecord(entity);

      this.tableService.insertOrMergeEntity(tableName, tableRecord, err => {
        if (err) {
          reject(err);
          return;
        }

        resolve(entity);
      });
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
        (err, tableRecord) => {
          if (err) {
            if (err["statusCode"] == 404 && returnNullOnNotFound) {
              resolve(null);
            } else {
              reject(err);
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
