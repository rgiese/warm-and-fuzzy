using System.Text.Json;

namespace WarmAndFuzzy
{

    public record ServerConfiguration
    {
        public required int WebServerPort { get; init; }
        public required int DeviceApiServerPort { get; init; }

        public required string DeviceConfigurationsFile { get; init; }

        public static ServerConfiguration ReadFromFile(string configurationFileName)
        {
            Console.WriteLine($"Loading server configuration from {configurationFileName}...");

            string serverConfigurationJson = File.ReadAllText(configurationFileName);

            return JsonSerializer.Deserialize<ServerConfiguration>(serverConfigurationJson) ?? throw new Exception("Could not read server configuration");
        }
    }

}