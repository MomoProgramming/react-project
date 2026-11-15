namespace Luminium.Api.Storage;

/// <summary>
/// Where uploaded files live. LocalFileStorage writes to disk for now; an
/// AzureBlobFileStorage can implement the same interface later (the storage
/// key maps directly to a blob name) and be swapped in Program.cs.
/// </summary>
public interface IFileStorage
{
    /// <summary>Saves the stream under <paramref name="key"/> (forward-slash separated, no leading slash).</summary>
    Task SaveAsync(string key, Stream content, CancellationToken ct = default);

    /// <summary>Deletes the file if it exists. Never throws for a missing file.</summary>
    Task DeleteAsync(string key, CancellationToken ct = default);
}
