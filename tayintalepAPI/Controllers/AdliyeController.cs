using Microsoft.AspNetCore.Mvc;
using TayinTalepAPI.Helpers;

[ApiController]
[Route("api/[controller]")]
public class AdliyeController : ControllerBase
{
    [HttpGet("liste")]
    public IActionResult Liste()
    {
        var adliyeler = AdliyeListesi.TumAdliyeler();
        return Ok(adliyeler);
    }
}
