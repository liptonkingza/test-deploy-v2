#!/bin/bash

echo "🚀 Starting Siamdrug Application..."

# Wait for database if needed
if [ ! -z "$DB_HOST" ]; then
    echo "⏳ Waiting for database connection..."
    until node -e "const mysql = require('mysql2/promise'); mysql.createConnection({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME}).then(() => process.exit(0)).catch(() => process.exit(1))" 2>/dev/null; do
        echo "Database not ready, waiting..."
        sleep 2
    done
    echo "✅ Database connection established"
fi

# Start the application
echo "🎯 Starting Node.js application..."
exec npm start
