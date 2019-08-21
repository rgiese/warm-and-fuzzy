export default class RestSensorValueStream {
  public constructor() {
    this.stream = "";
    this.ts = 0;

    this.publishedTime = new Date();
    this.deviceLocalSerial = 0;
    this.temperature = 0.0;
  }

  // Stream name (assigned by WarmAndFuzzy)
  public stream: string;

  // Timestamp attached by firmware when event was created
  public ts: Date;

  // Timestamp attached by Particle OS when event was published
  public publishedTime: Date;

  // Serial number (scoped to power cycle) attached by firmware when event was created
  public deviceLocalSerial: number;

  // Units: Celsius
  public temperature: number;
}
