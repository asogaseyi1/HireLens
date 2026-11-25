using HireLens.API.Dtos;
using HireLens.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace HireLens.API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/profile")]
    public class ProfileController(UserManager<AppUser> users) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<ProfileDto>> Get()
        {
            var user = await users.FindByIdAsync(User.GetUserId());
            if (user is null) return Unauthorized();
            return new ProfileDto(user.Email!, user.FullName, user.BaseResume);
        }

        [HttpPut]
        public async Task<ActionResult<ProfileDto>> Update(UpdateProfileRequest req)
        {
            var user = await users.FindByIdAsync(User.GetUserId());
            if (user is null) return Unauthorized();

            user.FullName = req.FullName;
            user.BaseResume = req.BaseResume;
            await users.UpdateAsync(user);

            return new ProfileDto(user.Email!, user.FullName, user.BaseResume);
        }
    }
}
