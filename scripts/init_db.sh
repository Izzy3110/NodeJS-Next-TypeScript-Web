#!/bin/bash

echo "Checking if database initialization is needed..."

# Set defaults if not provided
DB_HOST=${DB_HOST:-localhost}
DB_USER=${DB_USER:-dbuser}
DB_PASSWORD=${DB_PASSWORD:-qwert}
DB_NAME=${DB_NAME:-localdb}

# Check if the items table exists
TABLE_EXISTS=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -N -B -e "SHOW TABLES LIKE 'items';" 2>/dev/null)

if [ -z "$TABLE_EXISTS" ]; then
    echo "Table 'items' does not exist. Installing database from dump..."
    SQL_PATH="/app/dbdata/localdb__2026-02-22_22-12-30.sql"
    
    if [ -f "$SQL_PATH" ]; then
        echo "Executing SQL dump... This might take a moment."
        mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$SQL_PATH"
        if [ $? -eq 0 ]; then
            echo "Database initialized successfully!"
        else
            echo "Error executing SQL dump."
            exit 1
        fi
    else
        echo "CRITICAL ERROR: SQL dump file not found at $SQL_PATH"
        exit 1
    fi
else
    echo "Database 'items' table already exists. Skipping initialization."
fi
