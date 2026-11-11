namespace HSMAPI.Models;

public sealed class ApiOperationResponse
{
    public int Status { get; init; }
    public string? Response { get; init; }
    public bool IsSuccess { get; init; }
    public object? Errors { get; init; }
}
