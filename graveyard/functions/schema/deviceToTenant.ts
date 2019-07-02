import { IsRowKey } from "../common/azureTableStorage";

export class DeviceToTenant {
  /**
   * @name DeviceToTenant#deviceId
   *
   * Device ID (assigned by Particle)
   */
  @IsRowKey
  public deviceId: string;

  /**
   * @name DeviceToTenant#tenant
   *
   * Tenant name (assigned by WarmAndFuzzy)
   */
  public tenant: string;

  public constructor() {
    this.deviceId = "";
    this.tenant = "";
  }
}
