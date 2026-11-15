namespace Luminium.Api.Models;

public class CommissionRequest
{
    public const int NameMaxLength = 100;
    public const int EmailMaxLength = 254;
    public const int TitleMaxLength = 150;
    public const int DetailsMaxLength = 5000;
    public const int StatusMaxLength = 20;
    public const string DefaultStatus = "New";

    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Title { get; set; } = "";
    public string Details { get; set; } = "";
    public string Status { get; set; } = DefaultStatus;

    /// <summary>Always stored and returned as UTC.</summary>
    public DateTime CreatedAt { get; set; }

    public List<CommissionImage> Images { get; set; } = [];
}
