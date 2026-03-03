# Admin Dashboard & Menu System

A Next.js 14+ application for managing a restaurant menu, categories, and translations, backed by a MariaDB database.

## Features

- **Menu Management**: Create, edit, and delete menu items and categories.
- **Visual Editor**: WYSIWYG editing for descriptions and rich text.
- **Translation System**: Scalable, row-based translation system for valid multi-language support.
- **Backup & Restore**: Built-in tools to backup the database and project files.
- **Responsive Admin UI**: Modern, grid-based layout for managing data.

## Prerequisites

- **Node.js**: v18 or newer
- **MariaDB**: v10.6 or newer (or via Docker)

## Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd template_2_components
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env` file in the root directory (copy from `.env.example` if available) and configure your database connection:

    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=your_database_name
    DB_PORT=3306
    ```

4.  **Database Setup**:
    - Ensure your MariaDB server is running.
    - Run the migration scripts to set up the schema (if starting fresh, you might need to adjust based on existing dumps):
    ```bash
    npx ts-node -P tsconfig.scripts.json scripts/run_migration_v6.ts
    ```

## Docker Support (Database)

If you prefer running the database via Docker, a configuration is provided in `docker-mariadb/`.

1.  **Navigate to the directory**:
    ```bash
    cd docker-mariadb
    ```

2.  **Start the services**:
    ```bash
    docker-compose up -d
    ```
    This will start:
    - **MariaDB** on port `3306` (User: `root`, Password: `qwert`, DB: `localdb`)
    - **PhpMyAdmin** on port `8080` (http://localhost:8080)

3.  **Configure `.env`**:
    Update your project root `.env` to match the Docker credentials:
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=qwert
    DB_NAME=localdb
    DB_PORT=3306
    ```

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000/admin](http://localhost:3000/admin) to access the Admin Panel.

## Backup & Restore

### Manual Backup (CLI)
You can create a full backup (SQL Dump + Project Files) using the included script:

```bash
npx ts-node -P tsconfig.scripts.json scripts/backup_full.ts
```
Backups are stored in the `backups/` directory.

### Admin Panel
- Go to the **Backup** tab in the Admin Panel.
- Use **Create Backup** to generate a new snapshot.
- Use **Restore** (careful!) to overwrite the database with a selected backup.

## Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components/admin`: Admin panel components (`MenuEditor`, `CategoryManager`, etc.).
- `scripts`: Maintenance and migration scripts (TypeScript).
- `public`: Static assets.

## License

Private / Proprietary.
