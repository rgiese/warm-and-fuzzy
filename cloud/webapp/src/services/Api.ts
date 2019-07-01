import ApiGateway from "../services/ApiGateway";

class Api {
  public static async getConfig(): Promise<string> {
    return (await ApiGateway("GET", "/api/v1/getConfig")).data;
  }
}

export default Api;
