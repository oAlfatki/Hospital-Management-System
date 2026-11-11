using HSMDataAccess.DTOs;

namespace HSMAPI.Models;

public sealed class LoginResponse
{
    public bool Success { get; init; }
    public UserDTO? User { get; init; }
    public string? Error { get; init; }
}
