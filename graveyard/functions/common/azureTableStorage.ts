import * as AzureStorage from "azure-storage";
import "reflect-metadata";

//
// Internals/forwards
//

const propertyMetadataSymbol = Symbol("EntityPropertyMetadata");

class EntityPropertyMetadata {
  public isPartitionKey: boolean;
  public isRowKey: boolean;
  public dataType?: DataType;

  public constructor() {
    this.isPartitionKey = false;
    this.isRowKey = false;
    this.dataType = undefined;
  }
}

//
// Terminology:
//   - Entity: caller-supplied object (data model is inferred from this)
//   - Record: Azure Table Storage-compliant object, e.g. { <property>: { _: <value>, $: <type> }, ... }
//   - Property: a property in an entity or record (1:1 correspondence, just difference in layout)
//

//
// Property metadata
//

export const enum DataType {
  String = "Edm.String",
  // Edm.Binary
  Int64 = "Edm.Int64",
  Int32 = "Edm.Int32",
  Double = "Edm.Double",
  DateTime = "Edm.DateTime",
  // Edm.Guid
  Boolean = "Edm.Boolean",
}

// IsPartitionKey decorator
export function IsPartitionKey(target: any, propertyName: string | symbol): void {
  const propertyMetadata =
    (Reflect.getMetadata(propertyMetadataSymbol, target, propertyName) as EntityPropertyMetadata) ||
    new EntityPropertyMetadata();
  propertyMetadata.isPartitionKey = true;

  Reflect.defineMetadata(propertyMetadataSymbol, propertyMetadata, target, propertyName);
}

// IsRowKey decorator
export function IsRowKey(target: any, propertyName: string | symbol): void {
  const propertyMetadata =
    (Reflect.getMetadata(propertyMetadataSymbol, target, propertyName) as EntityPropertyMetadata) ||
    new EntityPropertyMetadata();
  propertyMetadata.isRowKey = true;

  Reflect.defineMetadata(propertyMetadataSymbol, propertyMetadata, target, propertyName);
}

// IsType decorator factory
export function IsType(dataType: DataType): Function {
  return function(target: any, propertyName: string | symbol): void {
    const propertyMetadata =
      (Reflect.getMetadata(
        propertyMetadataSymbol,
        target,
        propertyName
      ) as EntityPropertyMetadata) || new EntityPropertyMetadata();

    propertyMetadata.dataType = dataType;

    Reflect.defineMetadata(propertyMetadataSymbol, propertyMetadata, target, propertyName);
  };
}

//
// Exceptions
//

class UnrecognizedPropertyType extends Error {}
class MismatchedProperty extends Error {}
class InternalError extends Error {}

//
// Operations
//

// c.f. https://github.com/Azure/azure-storage-node/blob/master/lib/common/util/constants.js -> TableConstants.Operations
export const enum TableInsertStrategy {
  Insert = "INSERT",
  InsertOrReplace = "INSERT_OR_REPLACE",
  InsertOrMerge = "INSERT_OR_MERGE",
  Merge = "MERGE",
  Update = "UPDATE",
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

  public async InsertEntities<T>(
    tableName: string,
    entities: T[],
    insertStrategy: TableInsertStrategy
  ): Promise<AzureStorage.TableService.BatchResult[]> {
    let batch = new AzureStorage.TableBatch();

    entities.forEach((entity): void => {
      batch.addOperation(insertStrategy, this.entityToRecord(entity));
    });

    return new Promise((resolve, reject): void => {
      this.tableService.executeBatch(tableName, batch, (
        error: AzureStorage.StorageError,
        batchResults: AzureStorage.TableService.BatchResult[]
        //,response: AzureStorage.ServiceResponse
      ): void => {
        if (error) {
          reject(error);
          return;
        }

        resolve(batchResults);
      });
    });
  }

  public async RetrieveEntity<T>(
    tableName: string,
    partitionKey: string,
    rowKey: string,
    type: new () => T,
    returnNullOnNotFound: boolean = false
  ): Promise<T> {
    return new Promise<T>((resolve, reject): void => {
      this.tableService.retrieveEntity<any>(
        tableName,
        partitionKey,
        rowKey,
        (error: AzureStorage.StorageError, record: any): void => {
          if (error) {
            if (error.statusCode === 404 && returnNullOnNotFound) {
              resolve(undefined);
            } else {
              reject(error);
            }

            return;
          }

          try {
            resolve(this.recordToEntity(record, type));
          } catch (error) {
            reject(error);
            return;
          }
        }
      );
    });
  }

  public async TryRetrieveEntity<T>(
    tableName: string,
    partitionKey: string,
    rowKey: string,
    type: new () => T
  ): Promise<T> {
    return this.RetrieveEntity(tableName, partitionKey, rowKey, type, true);
  }

  public async QueryEntities<T>(
    tableName: string,
    query: AzureStorage.TableQuery,
    type: new () => T,
    returnNullOnNotFound: boolean = false
  ): Promise<T[]> {
    return new Promise<T[]>((resolve, reject): void => {
      this.tableService.queryEntities<any>(
        tableName,
        query,
        (null as unknown) as AzureStorage.TableService.TableContinuationToken, // AzureStorage's TypeScript definition is a bit broken
        (
          error: AzureStorage.StorageError,
          result: AzureStorage.TableService.QueryEntitiesResult<any>
          //,response: AzureStorage.ServiceResponse
        ): void => {
          if (error) {
            if (error.statusCode === 404 && returnNullOnNotFound) {
              resolve(undefined);
            } else {
              reject(error);
            }

            return;
          }

          // FUTURE: Deal with result.continuationToken
          try {
            resolve(result.entries.map((record): any => this.recordToEntity(record, type)));
          } catch (error) {
            reject(error);
            return;
          }
        }
      );
    });
  }

  //
  // entityToRecord
  //

  private entityToRecord(entity: any): any {
    let record: any = {};

    // Enumerate properties on source object
    Object.keys(entity).forEach((propertyName): void => {
      // Must have property descriptor to proceed
      const propertyDescriptor = Object.getOwnPropertyDescriptor(entity, propertyName);

      if (!propertyDescriptor) {
        return;
      }

      // Retrieve (or default-initialize) property metadata from decorators
      const propertyMetadata =
        (Reflect.getMetadata(
          propertyMetadataSymbol,
          entity,
          propertyName
        ) as EntityPropertyMetadata) || new EntityPropertyMetadata();

      // Determine property data type and value from decorator
      const propertyDataType =
        propertyMetadata.dataType || this.inferDataType(propertyDescriptor.value);
      const propertyValue =
        propertyDataType === DataType.DateTime
          ? propertyDescriptor.value.toISOString()
          : propertyDescriptor.value;

      // For partition or row keys, rename and coerce to string as needed
      const recordPropertyName = propertyMetadata.isPartitionKey
        ? "PartitionKey"
        : propertyMetadata.isRowKey
        ? "RowKey"
        : propertyName;

      const recordPropertyValue =
        propertyMetadata.isPartitionKey || propertyMetadata.isRowKey
          ? String(propertyValue)
          : propertyValue;

      const recordPropertyDataType =
        propertyMetadata.isPartitionKey || propertyMetadata.isRowKey
          ? DataType.String
          : propertyDataType;

      record[recordPropertyName] = {
        _: recordPropertyValue,
        $: recordPropertyDataType,
      };
    });

    return record;
  }

  //
  // recordToEntity
  //

  private recordToEntity<T>(record: any, type: new () => T): T {
    let entity = new type();

    // Enumerate properties on source record, validate
    Object.keys(record).forEach((propertyName): void => {
      switch (propertyName) {
        case "PartitionKey":
        case "RowKey":
        case "Timestamp":
        case ".metadata":
          // Skip further checks (will be assigned to target object if so defined)
          return;

        default:
          if (!(entity as any).hasOwnProperty(propertyName)) {
            throw new UnrecognizedPropertyType(
              `Property '${propertyName}' in table record not present in user-defined entity`
            );
          }
      }
    });

    // Enumerate properties on target entity, validate and assign values
    Object.keys(entity).forEach((propertyName): void => {
      // Must have property descriptor to proceed
      const propertyDescriptor = Object.getOwnPropertyDescriptor(entity, propertyName);

      if (!propertyDescriptor) {
        return;
      }

      // Retrieve (or default-initialize) property metadata from decorators
      const propertyMetadata =
        (Reflect.getMetadata(
          propertyMetadataSymbol,
          entity,
          propertyName
        ) as EntityPropertyMetadata) || new EntityPropertyMetadata();

      // Determine property data type and value from decorator
      const propertyDataType =
        propertyMetadata.dataType || this.inferDataType(propertyDescriptor.value);

      // For row keys, rename and coerce to string as needed
      const recordPropertyName = propertyMetadata.isPartitionKey
        ? "PartitionKey"
        : propertyMetadata.isRowKey
        ? "RowKey"
        : propertyName;

      const recordPropertyExpectedDataType =
        propertyMetadata.isPartitionKey || propertyMetadata.isRowKey
          ? DataType.String
          : propertyDataType;

      // Retrieve matching table record entity
      if (!record[recordPropertyName]) {
        throw new InternalError(
          `Property '${recordPropertyName}' should have been caught in earlier type check`
        );
      }

      const recordPropertyData = record[recordPropertyName];

      // Ensure types match
      if (recordPropertyData.$) {
        // Azure gave us an explicit type
        if (recordPropertyData.$ !== recordPropertyExpectedDataType) {
          throw new MismatchedProperty(
            `Property '${recordPropertyName}' is of explicit type ${recordPropertyData.$} in record, ${recordPropertyExpectedDataType} in entity`
          );
        }
      } else {
        // Infer type
        const recordPropertyActualDataType = this.inferDataType(recordPropertyData._);

        if (recordPropertyActualDataType !== recordPropertyExpectedDataType) {
          if (!this.canUpcast(recordPropertyActualDataType, recordPropertyExpectedDataType)) {
            throw new MismatchedProperty(
              `Property '${recordPropertyName}' is of implicit type ${recordPropertyActualDataType} in record, ${recordPropertyExpectedDataType} in entity`
            );
          }
        }
      }

      // Assign value
      const recordValue =
        propertyDataType === DataType.DateTime
          ? new Date(Date.parse(recordPropertyData._))
          : recordPropertyData._;

      // Restore proper type for row key properties (coerced to string)
      const propertyValue =
        propertyMetadata.isPartitionKey || propertyMetadata.isRowKey
          ? this.tryParseValue(recordPropertyData._ as string, propertyDataType)
          : recordValue;

      (entity as any)[propertyName] = propertyValue;
    });

    return entity;
  }

  //
  // Helpers
  //

  private inferDataType(value: any): DataType {
    switch (typeof value) {
      case "string":
        return DataType.String;

      case "number":
        return DataType.Int32;

      case "boolean":
        return DataType.Boolean;

      case "object":
        if (value instanceof Date) {
          return DataType.DateTime;
        }

      // __fallthrough;

      default:
        throw new UnrecognizedPropertyType(
          `Unknown property type ${typeof value} in user-defined entity`
        );
    }
  }

  private tryParseValue(value: string, dataType: DataType): string | number | Date | boolean {
    switch (dataType) {
      case DataType.String:
        return value;

      case DataType.Int64:
      case DataType.Int32:
        return parseInt(value);

      case DataType.Double:
        return parseFloat(value);

      case DataType.DateTime:
        return new Date(Date.parse(value));

      case DataType.Boolean:
        return value === "true";

      default:
        throw new InternalError(`tryParseValue: unknown data type ${dataType}`);
    }
  }

  private canUpcast(sourceType: DataType, targetType: DataType): boolean {
    switch (sourceType) {
      case DataType.Int32:
      case DataType.Int64:
        switch (targetType) {
          case DataType.Int64:
          case DataType.Double:
            return true;

          default:
          // __fallthrough;
        }

      // __fallthrough;

      default:
        throw new InternalError(`canUpcast: not prepared for ${sourceType}->${targetType} mapping`);
    }
  }
}
