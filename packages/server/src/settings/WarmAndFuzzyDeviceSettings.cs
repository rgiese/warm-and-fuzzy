using System.Text.Json;
using System.Text.RegularExpressions;

public class WarmAndFuzzyDeviceSetting
{
    public required string Name { get; set; }

    public void Validate() { }
}

public class WarmAndFuzzyDeviceSettings
{
    public required Dictionary<string, WarmAndFuzzyDeviceSetting> Devices { get; set; }
    public static WarmAndFuzzyDeviceSettings? DeviceSettings { get; set; }

    public void Validate()
    {
        foreach (var (deviceKey, deviceSetting) in Devices)
        {
            // Validate key
            if (!Regex.IsMatch(deviceKey, @"[0-9A-Fa-f]{12}"))
            {
                throw new Exception($"Device key {deviceKey} should be twelve hex digits.");
            }

            // Validate device setting
            deviceSetting.Validate();
        }
    }

    public static WarmAndFuzzyDeviceSettings ReadFromFile(string settingsFileName)
    {
        // Read device settings
        Console.WriteLine($"Loading device settings from {settingsFileName}...");

        string deviceSettingsJson = File.ReadAllText(settingsFileName);

        WarmAndFuzzyDeviceSettings deviceSettings = JsonSerializer.Deserialize<WarmAndFuzzyDeviceSettings>(deviceSettingsJson) ?? throw new Exception("Could not read device settings");

        deviceSettings.Validate();

        // Commit
        return deviceSettings;
    }

}
