using HireLens.API.Dtos;
using HireLens.API.Models;
using HireLens.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace HireLens.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController(UserManager<AppUser> users, ITokenService tokens) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest req)
        {
            if (await users.FindByEmailAsync(req.Email) is not null)
                return Conflict(new ProblemDetails { Title = "An account with this email already exists." });

            var user = new AppUser { UserName = req.Email, Email = req.Email, FullName = req.FullName };
            var result = await users.CreateAsync(user, req.Password);
            if (!result.Succeeded)
            {
                foreach (var e in result.Errors) ModelState.AddModelError(e.Code, e.Description);
                return ValidationProblem(ModelState);
            }

            return Ok(BuildResponse(user));
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest req)
        {
            var user = await users.FindByEmailAsync(req.Email);
            if (user is null || !await users.CheckPasswordAsync(user, req.Password))
                return Unauthorized(new ProblemDetails { Title = "Invalid email or password." });

            return Ok(BuildResponse(user));
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<UserDto>> Me()
        {
            var user = await users.FindByIdAsync(User.GetUserId());
            if (user is null) return Unauthorized();
            return new UserDto(user.Id, user.Email!, user.FullName);
        }

        private AuthResponse BuildResponse(AppUser user)
        {
            var (token, expires) = tokens.CreateToken(user);
            return new AuthResponse(token, expires, new UserDto(user.Id, user.Email!, user.FullName));
        }
    }
}
