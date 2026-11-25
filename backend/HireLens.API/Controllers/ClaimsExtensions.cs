using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace HireLens.API.Controllers
{
    public static class ClaimsExtensions
    {
        // JwtBearer is configured with MapInboundClaims = false, so the user id arrives as the raw "sub" claim.
        public static string GetUserId(this ClaimsPrincipal user) =>
            user.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? throw new InvalidOperationException("Authenticated user has no 'sub' claim.");
    }
}
