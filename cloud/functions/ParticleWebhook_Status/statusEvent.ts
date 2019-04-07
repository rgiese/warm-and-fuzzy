import { Equals, IsInt, IsHexadecimal, ArrayUnique, IsNumber } from "class-validator";
import { Type } from "class-transformer";

// See https://github.com/typestack/class-transformer
// See https://github.com/typestack/class-validator

//
// Example request body:
// {
//   "event": "status",
//   "data": {
//     "ts": 1554656303,
//     "temp": 23.6,
//     "hum": 41.5,
//     "ext": [
//       { "id": "2800581f0b0000d6", "temp": 22.9 },
//       { "id": "28c0e61d0b0000a3", "temp": 21.7 }
//     ]
//   },
//   "device_id": "17002c001247363333343437",
//   "published_at": "2019-04-07T16:58:25.604Z",
//   "fw_version": 1
// }
//
export class StatusEvent {
  @Equals("status")
  event: string;

  @IsHexadecimal()
  device_id: string;

  @Type(() => Date)
  published_at: Date;

  @IsInt()
  fw_version: number;

  @Type(() => StatusEventData)
  data: StatusEventData;
}

export class StatusEventData {
  @IsInt()
  ts: number;

  @IsNumber({ allowNaN: true }) // Allow NaN since the DHT22 fails to produce a measurement from time to time
  temp: number;

  @IsNumber({ allowNaN: true }) // (same)
  hum: number;

  @ArrayUnique()
  @Type(() => StatusEventExternalData)
  ext: StatusEventExternalData[];
}

export class StatusEventExternalData {
  @IsHexadecimal()
  id: string;

  @IsNumber()
  temp: number;
}
