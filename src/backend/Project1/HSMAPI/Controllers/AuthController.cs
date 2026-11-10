using HSMBusiness.Services;
using HSMDataAccess.DTOs;
using HSMDataAccess.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace HSMAPI.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController(UserService userService) : ControllerBase
    {
        /// <summary>
        /// Login endpoint — called by the frontend on sign-in.
        /// Accepts { email, password } and returns { success, user?, error? }
        /// </summary>
        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [SwaggerOperation(Summary = "Log in", Description = "Authenticates a user and returns the authenticated user information.")]
        [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { success = false, error = "Email and password are required" });
            }

            // Get all users and find one matching email + password
            var usersResult = await userService.GetAll();
            if (usersResult.userList == null)
            {
                return Unauthorized(new { success = false, error = "Invalid credentials" });
            }

            var matchedUser = usersResult.userList.FirstOrDefault(u =>
                u.Name != null && u.Name.Equals(request.Email, StringComparison.OrdinalIgnoreCase) &&
                u.PasswordHash != null && u.PasswordHash == request.Password
            );

            if (matchedUser == null)
            {
                return Unauthorized(new { success = false, error = "Invalid email or password" });
            }

            return Ok(new
            {
                success = true,
                user = new
                {
                    userId = matchedUser.UserID,
                    name = matchedUser.Name,
                    role = matchedUser.Role ?? "Doctor",
                    email = request.Email,
                    status = matchedUser.Status ? "Active" : "Inactive"
                }
            });
        }

        [HttpGet("{Id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(Summary = "Get a user", Description = "Gets a user by its identifier.")]
        [ProducesResponseType(typeof(UserDTO), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetUserByIdAsync(string Id)
        {
            if (string.IsNullOrEmpty(Id))
                return BadRequest(new { message = "ID is required" });

            var user = await userService.GetByID(Id);
            if (user.userDTO == null)
                return NotFound(new { message = "User not found" });

            return Ok(user.userDTO);
        }

        [HttpGet("users", Name = "GetAllUsers")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(Summary = "Get all users", Description = "Gets all users.")]
        [ProducesResponseType(typeof(IEnumerable<UserDTO>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllUsers()
        {
            var usersList = await userService.GetAll();
            if (usersList.Item4 == null)
                return NotFound(new { message = "No users found" });

            return Ok(usersList.userList);
        }

        [HttpPost("register", Name = "CreateUser")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [SwaggerOperation(Summary = "Register a user", Description = "Creates a new user account.")]
        [ProducesResponseType(typeof(ApiOperationResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> CreateUser(UserDTO user)
        {
            if (user == null)
                return NotFound();

            var NumOfUser = await userService.NumberOfPerson(user.PersonID);
            if (!NumOfUser.IsSuccess)
            {
                return StatusCode(500, new
                {
                    status = NumOfUser.Status,
                    response = NumOfUser.Response,
                    isSuccess = NumOfUser.IsSuccess,
                    errors = NumOfUser.errors
                });
            }
            userService.Mode = UserService.enMode.Add;
            var result = await userService.Save(user);

            if (!result.IsSuccess)
            {
                return BadRequest(new
                {
                    status = result.Status,
                    response = result.Response,
                    isSuccess = result.IsSuccess,
                    errors = result.errors
                });
            }

            return Ok(new
            {
                status = result.Status,
                response = result.Response,
                isSuccess = result.IsSuccess,
                errors = result.errors
            });
        }

        [HttpPut("{ID}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [SwaggerOperation(Summary = "Update a user", Description = "Updates an existing user by its identifier.")]
        [ProducesResponseType(typeof(ApiOperationResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> UpdateUser(string ID, UserDTO user)
        {
            if (user == null || string.IsNullOrEmpty(ID))
                return BadRequest();

            userService.Mode = UserService.enMode.Update;
            var result = await userService.Save(user, ID);

            if (!result.IsSuccess)
                return BadRequest(new
                {
                    status = result.Status,
                    response = result.Response,
                    isSuccess = result.IsSuccess,
                    errors = result.errors
                });

            return Ok(new
            {
                status = result.Status,
                response = result.Response,
                isSuccess = result.IsSuccess,
                errors = result.errors
            });
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [SwaggerOperation(Summary = "Delete a user", Description = "Deletes a user by its identifier.")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        public async Task<IActionResult> DeleteUser(string id)
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest();

            var result = await userService.Delete(id);

            if (!result.IsSuccess)
                return BadRequest();

            return Ok(result.Response);
        }
    }

    /// <summary>Request body for POST /api/auth/login</summary>
    public class LoginRequest
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
