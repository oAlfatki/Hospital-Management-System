namespace HSMBusiness.Erorrs;

public sealed class BusinessRuleException(int status, string message) : Exception(message)
{
    public int Status { get; } = status;
}
