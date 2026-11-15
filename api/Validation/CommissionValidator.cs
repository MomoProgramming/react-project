using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using Luminium.Api.Contracts;
using Luminium.Api.Models;

namespace Luminium.Api.Validation;

public sealed record ValidatedImage(IFormFile File, string Extension, string ContentType);

public sealed class CommissionValidationResult
{
    public Dictionary<string, List<string>> Errors { get; } = [];
    public bool IsValid => Errors.Count == 0;

    public string Name { get; init; } = "";
    public string Email { get; init; } = "";
    public string Title { get; init; } = "";
    public string Details { get; init; } = "";
    public List<ValidatedImage> Images { get; } = [];

    public void Add(string field, string message)
    {
        if (!Errors.TryGetValue(field, out var list)) Errors[field] = list = [];
        list.Add(message);
    }

    public IDictionary<string, string[]> ToErrorDictionary() =>
        Errors.ToDictionary(kv => kv.Key, kv => kv.Value.ToArray());
}

/// <summary>
/// Server-side mirror of the checks in src/Components/Request/Request.jsx.
/// Error keys are the form field names (name, email, title, details, inspiration)
/// so the frontend can show them next to the matching field.
/// </summary>
public static class CommissionValidator
{
    public const int MaxImages = 6;
    public const long MaxImageBytes = 5 * 1024 * 1024; // 5 MB

    // Same pattern as EMAIL_RE in Request.jsx (\z instead of $ so a trailing newline can't slip through).
    private static readonly Regex EmailRegex = new(
        @"^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}\z",
        RegexOptions.CultureInvariant | RegexOptions.Compiled);

    // Extension -> the content type that extension implies. Detected bytes must agree with both.
    private static readonly Dictionary<string, string> AllowedTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        [".jpg"] = "image/jpeg",
        [".jpeg"] = "image/jpeg",
        [".png"] = "image/png",
        [".gif"] = "image/gif",
        [".webp"] = "image/webp",
        [".bmp"] = "image/bmp",
    };

    public static async Task<CommissionValidationResult> ValidateAsync(CreateCommissionForm form, CancellationToken ct)
    {
        var r = new CommissionValidationResult
        {
            Name = (form.Name ?? "").Trim(),
            Email = (form.Email ?? "").Trim(),
            Title = (form.Title ?? "").Trim(),
            Details = (form.Details ?? "").Trim(),
        };

        // name
        if (r.Name.Length == 0) r.Add("name", "Please enter your name.");
        else if (r.Name.Length > CommissionRequest.NameMaxLength)
            r.Add("name", $"Name must be at most {CommissionRequest.NameMaxLength} characters.");
        else if (!IsValidName(r.Name))
            r.Add("name", "Name can only contain letters, spaces, . ' and -.");

        // email
        if (r.Email.Length == 0) r.Add("email", "Please enter your email.");
        else if (r.Email.Length > CommissionRequest.EmailMaxLength)
            r.Add("email", $"Email must be at most {CommissionRequest.EmailMaxLength} characters.");
        else if (!EmailRegex.IsMatch(r.Email))
            r.Add("email", "Enter a valid email, e.g. name@site.com");

        // title
        if (r.Title.Length == 0) r.Add("title", "Please enter a project title.");
        else if (r.Title.Length > CommissionRequest.TitleMaxLength)
            r.Add("title", $"Project title must be at most {CommissionRequest.TitleMaxLength} characters.");

        // details
        if (r.Details.Length == 0) r.Add("details", "Please describe your project.");
        else if (r.Details.Length > CommissionRequest.DetailsMaxLength)
            r.Add("details", $"Project details must be at most {CommissionRequest.DetailsMaxLength} characters.");

        // inspiration images
        var files = form.Inspiration ?? [];
        if (files.Count > MaxImages)
        {
            r.Add("inspiration", $"You can attach at most {MaxImages} images.");
            return r; // don't bother inspecting the files
        }

        foreach (var file in files)
        {
            var label = string.IsNullOrWhiteSpace(file.FileName) ? "An image" : $"\"{Path.GetFileName(file.FileName)}\"";
            var ext = Path.GetExtension(file.FileName ?? "");

            if (file.Length == 0) { r.Add("inspiration", $"{label} is empty."); continue; }
            if (file.Length > MaxImageBytes) { r.Add("inspiration", $"{label} is larger than 5 MB."); continue; }

            if (!AllowedTypes.TryGetValue(ext, out var expectedType)
                || !string.Equals(file.ContentType, expectedType, StringComparison.OrdinalIgnoreCase))
            {
                r.Add("inspiration", $"{label} must be a JPG, PNG, GIF, WebP or BMP image.");
                continue;
            }

            var detected = await DetectImageTypeAsync(file, ct);
            if (detected != expectedType)
            {
                r.Add("inspiration", $"{label} is not a valid image file.");
                continue;
            }

            r.Images.Add(new ValidatedImage(file, ext.ToLowerInvariant() == ".jpeg" ? ".jpg" : ext.ToLowerInvariant(), detected));
        }

        return r;
    }

    /// <summary>
    /// Same rule as NAME_RE in Request.jsx: the first character is a Unicode letter (\p{L});
    /// after that letters, combining marks (\p{M}), space, '.', apostrophe (' or ’) and '-'.
    /// Works on Runes so letters outside the Basic Multilingual Plane behave like JS's /u flag.
    /// </summary>
    public static bool IsValidName(string name)
    {
        var first = true;
        foreach (var rune in name.EnumerateRunes())
        {
            var cat = Rune.GetUnicodeCategory(rune);
            var isLetter = cat is UnicodeCategory.UppercaseLetter or UnicodeCategory.LowercaseLetter
                or UnicodeCategory.TitlecaseLetter or UnicodeCategory.ModifierLetter or UnicodeCategory.OtherLetter;

            if (first)
            {
                if (!isLetter) return false;
                first = false;
                continue;
            }

            var isMark = cat is UnicodeCategory.NonSpacingMark or UnicodeCategory.SpacingCombiningMark
                or UnicodeCategory.EnclosingMark;
            var isPunct = rune.Value is ' ' or '.' or '\'' or '’' or '-';
            if (!isLetter && !isMark && !isPunct) return false;
        }
        return !first;
    }

    /// <summary>Identifies the image format from its leading bytes ("magic numbers").</summary>
    private static async Task<string?> DetectImageTypeAsync(IFormFile file, CancellationToken ct)
    {
        var h = new byte[12];
        await using var s = file.OpenReadStream();
        var n = await s.ReadAtLeastAsync(h, h.Length, throwOnEndOfStream: false, ct);

        bool StartsWith(params byte[] sig) => n >= sig.Length && h.AsSpan(0, sig.Length).SequenceEqual(sig);

        if (StartsWith(0xFF, 0xD8, 0xFF)) return "image/jpeg";
        if (StartsWith(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)) return "image/png";
        if (StartsWith("GIF87a"u8.ToArray()) || StartsWith("GIF89a"u8.ToArray())) return "image/gif";
        if (n >= 12 && h.AsSpan(0, 4).SequenceEqual("RIFF"u8) && h.AsSpan(8, 4).SequenceEqual("WEBP"u8)) return "image/webp";
        if (StartsWith((byte)'B', (byte)'M')) return "image/bmp";
        return null;
    }
}
