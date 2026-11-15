# Luminium API

ASP.NET Core Web API (.NET 10, controllers) that stores commission requests from
`src/Components/Request/Request.jsx` in MySQL via Entity Framework Core.

- `POST /api/commissions` (multipart/form-data) → `201 { "id": 123 }`, or `400` with field errors.
- Images are written to disk (`api/uploads/`, gitignored). Only metadata and the storage path
  are stored in MySQL; image bytes never go into the database.

## EF Core provider: Oracle `MySql.EntityFrameworkCore` 10.0.12 (EF Core 10.0.12)

The other option was Pomelo `Pomelo.EntityFrameworkCore.MySql` 9.0.0 with EF Core 9.0.x. We chose Oracle's provider because:

- **Support lifecycle.** EF Core 9 and .NET 9 went out of support on 10 Nov 2026. EF Core 10 and .NET 10 are LTS and supported until Nov 2028. Pomelo 9.0.0 would have started us on an unsupported stack.
- **Matching tools.** The provider pulls in EF Core 10.0.12, which matches the `dotnet-ef` 10.0.12 global tool.
- **Official support.** Oracle supports this provider for MySQL 8.0 and 8.4, and for Azure Database for MySQL Flexible Server.

Trade-off: Pomelo is more widely used and has more community answers. If we ever switch, these parts change:
- the package reference;
- `UseMySQL(...)` becomes `UseMySql(..., ServerVersion...)`;
- the migration is regenerated.

All EF Core packages are pinned to **10.0.12**. Keep `MySql.EntityFrameworkCore`, `Microsoft.EntityFrameworkCore.Design` and `dotnet-ef` on the same EF Core minor version when upgrading.

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| .NET SDK | 10.0.x | `dotnet --version` |
| dotnet-ef | 10.0.x | `dotnet tool install --global dotnet-ef --version 10.0.12` (or `dotnet tool update ...`) |
| MySQL Server | **8.4 LTS** (8.0 also works) | `mysql --version` or `SELECT VERSION();` |
| Node.js | for the Vite frontend | `node --version` |

> MySQL 8.0 reached end of life in April 2026. Develop against **8.4** so local matches Azure Flexible Server.
> Note: upgrading MySQL *Workbench* does not upgrade the *server*. Check with `SELECT VERSION();`.

## Connection details (no passwords here)

| | Development | Testing |
|---|---|---|
| Host | `localhost` | `localhost` |
| Port | `3306` | `3306` |
| Database | `luminium_dev` | `luminium_test` |
| User | `luminium_app` | `luminium_app` |
| Environment | `Development` | `Testing` |
| Config file | `appsettings.Development.json` | `appsettings.Testing.json` |
| API URL | http://localhost:5080 | http://localhost:5081 |

`ConnectionStrings:DefaultConnection` holds everything except the password. The password is read from the
configuration key `Db:Password`, which locally comes from **user-secrets**. `appsettings*.json` never contain a password.

## 1. Create the databases and user (once)

Run this as an admin (e.g. `root`) in MySQL Workbench or `mysql -u root -p`, choosing your own password:

```sql
CREATE DATABASE IF NOT EXISTS luminium_dev  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS luminium_test CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

CREATE USER IF NOT EXISTS 'luminium_app'@'localhost' IDENTIFIED BY '<choose-a-password>';
GRANT ALL PRIVILEGES ON luminium_dev.*  TO 'luminium_app'@'localhost';
GRANT ALL PRIVILEGES ON luminium_test.* TO 'luminium_app'@'localhost';
FLUSH PRIVILEGES;
```

The app user can only touch these two databases. On Azure, use a separate user with fewer rights for the
running app if you like; migrations need DDL rights.

## 2. Store the password with user-secrets

From the `api/` folder:

```powershell
cd api
dotnet user-secrets set "Db:Password" ""
dotnet user-secrets list   # check it's there
```

Secrets are stored in your Windows user profile (`%APPDATA%\Microsoft\UserSecrets\5ddf9767-30ca-459f-8d75-a1349d1c1e0a\`),
not in the repo. Development and Testing both read them, and they share the same user, so one secret is enough.

## 3. Apply migrations

```powershell
cd api
dotnet ef database update                              # luminium_dev  (Development is the default)
dotnet ef database update -- --environment Testing     # luminium_test
```

To change the model later:

```powershell
dotnet ef migrations add <Name>
dotnet ef migrations script --idempotent -o migrate.sql   # SQL to review or run on Azure
```

## 4. Run the API

```powershell
cd api
dotnet run --launch-profile http       # Development -> http://localhost:5080, DB luminium_dev
dotnet run --launch-profile testing    # Testing     -> http://localhost:5081, DB luminium_test
```

Quick check (Git Bash or any shell with curl):

```bash
curl -i -F "name=" http://localhost:5080/api/commissions        # 400 with field errors
curl -i -F "name=Ana" -F "email=ana@site.com" -F "title=Logo" -F "details=Hi" \
     -F "inspiration=@picture.png;type=image/png" http://localhost:5080/api/commissions   # 201 {"id":1}
```

## 5. Run the frontend against it

From the repo root:

```powershell
copy .env.example .env      # VITE_API_URL=http://localhost:5080
npm install
npm run dev                 # http://localhost:5173
```

The API allows CORS from `http://localhost:5173` in Development and Testing. Restart `npm run dev` after editing `.env`.

## Validation rules (`Validation/CommissionValidator.cs`)

These match `Request.jsx`. Values are trimmed first.

| Field | Rules |
|---|---|
| `name` | required, max 100, starts with a Unicode letter, then letters / combining marks / space / `.` / `'` / `’` / `-` |
| `email` | required, max 254, same pattern as the form's `EMAIL_RE` |
| `title` | required, max 150 |
| `details` | required, max 5000 |
| `inspiration` | optional, max 6 files, each ≤ 5 MB, `.jpg/.jpeg/.png/.gif/.webp/.bmp`, matching content type, **and** the file's first bytes must be that format (the content type alone can be faked). SVG is rejected because it can contain scripts. |

Error responses are standard `ValidationProblemDetails`. The keys are the form field names:

```json
{ "title": "One or more validation errors occurred.", "status": 400,
  "errors": { "email": ["Enter a valid email, e.g. name@site.com"] } }
```

The maximum request size is 32 MB (6 × 5 MB plus form fields).

## File storage

- `Storage/IFileStorage.cs` is the abstraction, and `Storage/LocalFileStorage.cs` writes to `Uploads:RootPath`
  (`uploads/` for Development, `uploads/test/` for Testing).
- Files are named `yyyy/MM/<guid>.<ext>`. The user's file name is only kept as metadata.
- If saving to the database fails, the files already written are deleted.
- **Azure later:** add an `AzureBlobFileStorage : IFileStorage` (Azure.Storage.Blobs). The storage key becomes the
  blob name. Register it in `Program.cs` instead of `LocalFileStorage`. App Service disk is not a good place for uploads.

## Deploying to Azure (notes for later)

- **Connection string.** Either:
  - set the full `ConnectionStrings__DefaultConnection` as an App Service connection string or setting, or
  - keep the connection string without a password and set `Db__Password` (ideally a Key Vault reference).
- **TLS.** Azure Flexible Server requires TLS: use `SslMode=Required` (or `VerifyFull` with the CA certificate).
- **CORS.** Set `Cors__AllowedOrigins__0=https://<your-frontend-host>`.
- **Upload size on Windows.** If you host on **Windows** App Service (IIS), its default request limit is about 28.6 MB.
  Raise `maxAllowedContentLength` in `web.config` to at least `33554432`. Linux App Service doesn't need this.
- **Migrations.** Apply them from CI or by hand with `dotnet ef migrations script --idempotent`.
  Don't call `Database.Migrate()` at app startup.
- **Future GET endpoints.** `GET /api/commissions` and `GET /api/commissions/{id}` for the artist dashboard aren't built yet.
  They expose customer names and emails, so they **must require authentication** (e.g. Microsoft Entra ID) before going live.
