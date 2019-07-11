import ApiGateway from "./ApiGateway";

class ConfigApi {
  public static async list(): Promise<string> {
    return (await ApiGateway("GET", "/api/v1/config")).data;
  }
}

export default ConfigApi;
