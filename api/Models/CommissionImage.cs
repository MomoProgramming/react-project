namespace Luminium.Api.Models;

/// <summary>
/// Metadata for an uploaded inspiration image. The bytes live in file storage
/// (local disk now, Azure Blob Storage later) — never in the database.
/// </summary>
public class CommissionImage
{
    public const int FileNameMaxLength = 255;
    public const int ContentTypeMaxLength = 100;
    public const int StoragePathMaxLength = 500;

    public int Id { get; set; }
    public int CommissionRequestId { get; set; }
    public CommissionRequest? CommissionRequest { get; set; }

    /// <summary>Original file name as sent by the browser (display only, never used as a path).</summary>
    public string FileName { get; set; } = "";

    /// <summary>Content type detected from the file's bytes, not the client's claim.</summary>
    public string ContentType { get; set; } = "";

    public long SizeBytes { get; set; }

    /// <summary>Storage key relative to the storage root, e.g. "2026/11/3f2c….png".</summary>
    public string StoragePath { get; set; } = "";
}
