
// Parse command line
if (args.Length < 1)
{
    Console.Error.WriteLine("server.exe pathToSettings.json");
    return -1;
}

string settingsFileName = args[0];

// Load settings
WarmAndFuzzyServerSettings.ServerSettings = WarmAndFuzzyServerSettings.ReadFromFile(settingsFileName);

WarmAndFuzzyDeviceSettings.DeviceSettings = WarmAndFuzzyDeviceSettings.ReadFromFile(Path.Combine(new string[] { Path.GetDirectoryName(settingsFileName) ?? ".", WarmAndFuzzyServerSettings.ServerSettings.DeviceSettingsFile }));

// Run
Console.WriteLine($"Opening web server at {WarmAndFuzzyServerSettings.ServerSettings.WebServerPort}...");

WebApplication webApplication;
{
    // Create builder
    var builder = WebApplication.CreateBuilder(new WebApplicationOptions
    {
        WebRootPath = "webroot"
    });
    {
        builder.Services.AddRazorPages();
    }

    // Build app
    webApplication = builder.Build();

    // Configure app
    webApplication.UseStaticFiles();

    webApplication.UseRouting();

    webApplication.MapRazorPages();
}

webApplication.Run($"http://localhost:{WarmAndFuzzyServerSettings.ServerSettings.WebServerPort}");

Console.WriteLine($"Opening device API server at {WarmAndFuzzyServerSettings.ServerSettings.DeviceApiServerPort}...");

return 0;
