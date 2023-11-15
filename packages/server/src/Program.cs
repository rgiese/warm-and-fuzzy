
// Parse command line
if (args.Length < 1)
{
    Console.Error.WriteLine("server.exe pathToSettings.json");
    return -1;
}

string settingsFileName = args[0];

// Load settings
WarmAndFuzzyServerSettings serverSettings = WarmAndFuzzyServerSettings.ReadFromFile(settingsFileName);

WarmAndFuzzyDeviceSettings deviceSettings = WarmAndFuzzyDeviceSettings.ReadFromFile(Path.Combine(new string[] { Path.GetDirectoryName(settingsFileName) ?? ".", serverSettings.DeviceSettingsFile }));

foreach (var deviceSetting in deviceSettings.Devices)
{
    Console.WriteLine($"  Device {deviceSetting.Key}: {deviceSetting.Value.Name}");
}

// Run
Console.WriteLine($"Opening web server at {serverSettings.WebServerPort}...");

Console.WriteLine($"Opening device API server at {serverSettings.DeviceApiServerPort}...");

return 0;
