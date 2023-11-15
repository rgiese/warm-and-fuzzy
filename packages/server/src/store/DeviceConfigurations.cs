using System.Text.Json;
using System.Text.RegularExpressions;

namespace WarmAndFuzzy
{
    public record DeviceConfiguration
    {
        public required string Name { get; init; }

        public void Validate() { }
    }

    public record DeviceConfigurations
    {
        public required Dictionary<string, DeviceConfiguration> Devices { get; init; }

        public void Validate()
        {
            foreach (var (deviceKey, deviceConfiguration) in Devices)
            {
                // Validate key
                if (!Regex.IsMatch(deviceKey, @"[0-9A-Fa-f]{12}"))
                {
                    throw new Exception($"Device key {deviceKey} should be twelve hex digits.");
                }

                // Validate device setting
                deviceConfiguration.Validate();
            }
        }

        public static DeviceConfigurations ReadFromFile(string configurationFileName)
        {
            // Read device settings
            Console.WriteLine($"Loading device configurations from {configurationFileName}...");

            string deviceConfigurationsJson = File.ReadAllText(configurationFileName);

            DeviceConfigurations deviceConfigurations = JsonSerializer.Deserialize<DeviceConfigurations>(deviceConfigurationsJson) ?? throw new Exception("Could not read device configurations");

            deviceConfigurations.Validate();

            // Commit
            return deviceConfigurations;
        }
    }
}