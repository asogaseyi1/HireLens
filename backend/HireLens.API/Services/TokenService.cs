using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HireLens.API.Models;
using Microsoft.IdentityModel.Tokens;

namespace HireLens.API.Services
{
    public class JwtOptions
    {
        public string Key { get; set; } = string.Empty;
        public string Issuer { get; set; } = "HireLens";
        public string Audience { get; set; } = "HireLens";
        public int ExpiryMinutes { get; set; } = 60 * 24 * 7;
    }

    public interface ITokenService
    {
        (string Token, DateTime ExpiresAt) CreateToken(AppUser user);
    }

    public class TokenService(JwtOptions options) : ITokenService
    {
        public (string Token, DateTime ExpiresAt) CreateToken(AppUser user)
        {
            var expires = DateTime.UtcNow.AddMinutes(options.ExpiryMinutes);
            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Id),
                new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var creds = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Key)),
                SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: options.Issuer,
                audience: options.Audience,
                claims: claims,
                expires: expires,
                signingCredentials: creds);

            return (new JwtSecurityTokenHandler().WriteToken(token), expires);
        }
    }
}
