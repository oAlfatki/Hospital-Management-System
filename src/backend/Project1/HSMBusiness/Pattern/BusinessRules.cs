using HSMBusiness.Erorrs;

namespace HSMBusiness.Pattern;

internal static class BusinessRules
{
    public static string Id() => Guid.NewGuid().ToString("N")[..10];
    public static decimal Money(decimal amount) => decimal.Round(amount, 2, MidpointRounding.AwayFromZero);
    public static void Require(bool condition, string message, int status = 400)
    {
        if (!condition) throw new BusinessRuleException(status, message);
    }
    public static T Found<T>(T? entity, string message = "Record not found.") where T : class =>
        entity ?? throw new BusinessRuleException(404, message);
}
