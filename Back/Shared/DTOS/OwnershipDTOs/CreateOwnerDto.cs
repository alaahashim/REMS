using System.ComponentModel.DataAnnotations;

namespace Shared.DTOS;

public class CreateOwnerDto
{
    [Required]
    public string NationalId { get; set; } = null!;

    [Required]
    public string FullName { get; set; } = null!;

    [Required]
    public string Phone { get; set; } = null!;

    [Required]
    public string Address { get; set; } = null!;

    [Required]
    public string OwnerType { get; set; } = null!;
}