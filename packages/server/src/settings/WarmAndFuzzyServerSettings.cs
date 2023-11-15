using System.Text.Json;

public class WarmAndFuzzyServerSettings
{
    public required int WebServerPort { get; set; }
    public required int DeviceApiServerPort { get; set; }

    public required string DeviceSettingsFile { get; set; }

    public static WarmAndFuzzyServerSettings ReadFromFile(string settingsFileName)
    {
        Console.WriteLine($"Loading server settings from {settingsFileName}...");

        string serverSettingsJson = File.ReadAllText(settingsFileName);

        return JsonSerializer.Deserialize<WarmAndFuzzyServerSettings>(serverSettingsJson) ?? throw new Exception("Could not read server settings");
    }
}
