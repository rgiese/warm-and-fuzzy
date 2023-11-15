using System.Text.Json;

namespace WarmAndFuzzy
{

    public class ServerConfiguration
    {
        public required int WebServerPort { get; set; }
        public required int DeviceApiServerPort { get; set; }

        public required string DeviceConfigurationsFile { get; set; }

        public static ServerConfiguration ReadFromFile(string configurationFileName)
        {
            Console.WriteLine($"Loading server configuration from {configurationFileName}...");

            string serverConfigurationJson = File.ReadAllText(configurationFileName);

            return JsonSerializer.Deserialize<ServerConfiguration>(serverConfigurationJson) ?? throw new Exception("Could not read server configuration");
        }
    }

}