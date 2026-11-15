using Luminium.Api.Contracts;
using Luminium.Api.Data;
using Luminium.Api.Models;
using Luminium.Api.Storage;
using Luminium.Api.Validation;
using Microsoft.AspNetCore.Mvc;

namespace Luminium.Api.Controllers;

[ApiController]
[Route("api/commissions")]
public class CommissionsController(AppDbContext db, IFileStorage storage, ILogger<CommissionsController> logger)
    : ControllerBase
{
    // 6 images x 5 MB + text fields + multipart overhead. Kestrel's default (~28.6 MB) is too small.
    private const long MaxRequestBytes = 32 * 1024 * 1024;

    // NOTE: GET endpoints for the artist dashboard are intentionally not implemented yet.
    // They expose customers' names and emails, so they must require authentication before going live.

    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MaxRequestBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxRequestBytes)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromForm] CreateCommissionForm form, CancellationToken ct)
    {
        var result = await CommissionValidator.ValidateAsync(form, ct);
        if (!result.IsValid)
            return ValidationProblem(new ValidationProblemDetails(result.ToErrorDictionary()));

        var now = DateTime.UtcNow;
        var request = new CommissionRequest
        {
            Name = result.Name,
            Email = result.Email,
            Title = result.Title,
            Details = result.Details,
            CreatedAt = now,
        };

        // Write files first, then the database row. If anything fails, remove the files we wrote.
        var savedKeys = new List<string>();
        try
        {
            foreach (var img in result.Images)
            {
                var key = $"{now:yyyy}/{now:MM}/{Guid.NewGuid():N}{img.Extension}";
                await using (var stream = img.File.OpenReadStream())
                    await storage.SaveAsync(key, stream, ct);
                savedKeys.Add(key);

                request.Images.Add(new CommissionImage
                {
                    FileName = TrimFileName(Path.GetFileName(img.File.FileName)),
                    ContentType = img.ContentType,
                    SizeBytes = img.File.Length,
                    StoragePath = key,
                });
            }

            db.CommissionRequests.Add(request);
            await db.SaveChangesAsync(ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Saving commission request failed; removing {Count} uploaded file(s).", savedKeys.Count);
            foreach (var key in savedKeys)
            {
                try { await storage.DeleteAsync(key, CancellationToken.None); }
                catch (Exception cleanupEx) { logger.LogWarning(cleanupEx, "Could not delete orphaned upload {Key}", key); }
            }
            throw; // -> 500 via the exception handler
        }

        logger.LogInformation("Commission request {Id} created with {Count} image(s).", request.Id, request.Images.Count);
        return StatusCode(StatusCodes.Status201Created, new { id = request.Id });
    }

    private static string TrimFileName(string name) =>
        name.Length <= CommissionImage.FileNameMaxLength ? name : name[..CommissionImage.FileNameMaxLength];
}
