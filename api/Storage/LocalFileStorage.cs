namespace Luminium.Api.Storage;

public class LocalFileStorageOptions
{
    /// <summary>Root folder; relative paths are resolved against the app's content root (the api/ folder).</summary>
    public string RootPath { get; set; } = "uploads";
}

public class LocalFileStorage : IFileStorage
{
    private readonly string _root;

    public LocalFileStorage(LocalFileStorageOptions options, IWebHostEnvironment env)
    {
        _root = Path.GetFullPath(Path.Combine(env.ContentRootPath, options.RootPath));
        Directory.CreateDirectory(_root);
    }

    public async Task SaveAsync(string key, Stream content, CancellationToken ct = default)
    {
        var path = Resolve(key);
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        await using var file = new FileStream(path, FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, useAsync: true);
        await content.CopyToAsync(file, ct);
    }

    public Task DeleteAsync(string key, CancellationToken ct = default)
    {
        var path = Resolve(key);
        if (File.Exists(path)) File.Delete(path);
        return Task.CompletedTask;
    }

    // Keys are generated server-side, but guard against path traversal anyway.
    private string Resolve(string key)
    {
        var full = Path.GetFullPath(Path.Combine(_root, key.Replace('/', Path.DirectorySeparatorChar)));
        if (!full.StartsWith(_root + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("Invalid storage key.", nameof(key));
        return full;
    }
}
