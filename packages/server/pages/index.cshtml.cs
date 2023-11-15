using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

public class IndexModel : PageModel
{
    public WarmAndFuzzyDeviceSettings? DeviceSettings { get; set; } = WarmAndFuzzyDeviceSettings.DeviceSettings;

    public void OnGet()
    {
    }
}
