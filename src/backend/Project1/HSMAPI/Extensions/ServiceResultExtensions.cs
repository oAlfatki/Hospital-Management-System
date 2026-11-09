using HSMBusiness.Pattern;
using Microsoft.AspNetCore.Mvc;

namespace HSMAPI.Extensions;

public static class ServiceResultExtensions
{
    public static IActionResult ToActionResult<T>(this ResultPatern.ResultResponse<T> result, ControllerBase controller)
    {
        if (!result.IsSuccess) return controller.Problem(statusCode: result.Status, title: result.Response);
        return result.Status == 204 ? controller.NoContent() : controller.StatusCode(result.Status, result.Data);
    }
}
