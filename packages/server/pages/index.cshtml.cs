using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

using WarmAndFuzzy;

public class IndexModel : PageModel
{
    public DeviceConfigurations DeviceConfigurations { get; set; } = Store.Instance.DeviceConfigurations;

    public void OnGet()
    {
    }
}
