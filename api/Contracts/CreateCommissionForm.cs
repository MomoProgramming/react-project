namespace Luminium.Api.Contracts;

/// <summary>
/// multipart/form-data sent by src/Components/Request/Request.jsx.
/// Everything is nullable so CommissionValidator produces all field errors
/// (instead of the framework's automatic "field is required" responses).
/// </summary>
public class CreateCommissionForm
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Title { get; set; }
    public string? Details { get; set; }

    /// <summary>Form key "inspiration", repeated once per image.</summary>
    public List<IFormFile>? Inspiration { get; set; }
}
