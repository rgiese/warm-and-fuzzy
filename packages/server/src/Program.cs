using WarmAndFuzzy;

// Parse command line
if (args.Length < 1)
{
    Console.Error.WriteLine("server.exe pathToServerConfiguration.json");
    return -1;
}

string settingsFileName = args[0];

// Load settings
Store.Initialize(settingsFileName);

Store store = Store.Instance; // grab shortcut

// Run
Console.WriteLine($"Opening web server at {store.ServerConfiguration.WebServerPort}...");

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

Console.WriteLine($"Opening device API server at {store.ServerConfiguration.DeviceApiServerPort}...");

WebApplication deviceApiApplication;
{
    // Create builder
    var builder = WebApplication.CreateBuilder();

    // Build app
    deviceApiApplication = builder.Build();

    // Configure API
    deviceApiApplication.MapGet("/devices", () =>
    {
        return store.DeviceConfigurations.Devices;
    });
}

await Task.WhenAny(
webApplication.RunAsync($"http://localhost:{store.ServerConfiguration.WebServerPort}"),
deviceApiApplication.RunAsync($"http://localhost:{store.ServerConfiguration.DeviceApiServerPort}"));


return 0;
