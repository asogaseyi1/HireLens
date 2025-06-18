using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace HireLens.API.Models
{
    public class AppUser : IdentityUser
    {
        [Key]
        public new int Id { get; set; }
        public string? FullName { get; set; }
    }
}
