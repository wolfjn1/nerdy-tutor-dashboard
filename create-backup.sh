#!/bin/bash

# Backup script for Nerdy Tutor Dashboard
# Creates a timestamped backup of critical files

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="backup-$TIMESTAMP"

echo "Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Create subdirectories
mkdir -p "$BACKUP_DIR/app/dashboard"
mkdir -p "$BACKUP_DIR/app/auth"
mkdir -p "$BACKUP_DIR/lib/stores"
mkdir -p "$BACKUP_DIR/lib/auth"
mkdir -p "$BACKUP_DIR/lib/utils"
mkdir -p "$BACKUP_DIR/components/ui"

# Copy configuration files
echo "Backing up configuration files..."
cp package.json "$BACKUP_DIR/" 2>/dev/null
cp package-lock.json "$BACKUP_DIR/" 2>/dev/null
cp next.config.js "$BACKUP_DIR/" 2>/dev/null
cp tailwind.config.js "$BACKUP_DIR/" 2>/dev/null
cp tsconfig.json "$BACKUP_DIR/" 2>/dev/null
cp middleware.ts "$BACKUP_DIR/" 2>/dev/null
cp vercel.json "$BACKUP_DIR/" 2>/dev/null
cp postcss.config.js "$BACKUP_DIR/" 2>/dev/null

# Copy app files
echo "Backing up app files..."
cp app/layout.tsx "$BACKUP_DIR/app/" 2>/dev/null
cp app/globals.css "$BACKUP_DIR/app/" 2>/dev/null
cp app/\(dashboard\)/dashboard/page.tsx "$BACKUP_DIR/app/dashboard/dashboard.page.tsx" 2>/dev/null
cp app/\(dashboard\)/layout.tsx "$BACKUP_DIR/app/dashboard/layout.tsx" 2>/dev/null

# Copy lib files
echo "Backing up lib files..."
cp -r lib/stores/* "$BACKUP_DIR/lib/stores/" 2>/dev/null
cp -r lib/auth/* "$BACKUP_DIR/lib/auth/" 2>/dev/null
cp -r lib/utils/* "$BACKUP_DIR/lib/utils/" 2>/dev/null
cp lib/theme-context.tsx "$BACKUP_DIR/lib/" 2>/dev/null
cp lib/types/index.ts "$BACKUP_DIR/lib/" 2>/dev/null

# Copy documentation
echo "Backing up documentation..."
cp README.md "$BACKUP_DIR/" 2>/dev/null
cp CHECKPOINT_README.md "$BACKUP_DIR/" 2>/dev/null
cp VERCEL_ENV_SETUP.md "$BACKUP_DIR/" 2>/dev/null
cp DARK_MODE_IMPLEMENTATION.md "$BACKUP_DIR/" 2>/dev/null

# Create a backup info file
cat > "$BACKUP_DIR/backup-info.txt" << EOF
Backup created: $(date)
Git commit: $(git rev-parse HEAD)
Git branch: $(git branch --show-current)
Node version: $(node --version)
NPM version: $(npm --version)

Files backed up:
$(find "$BACKUP_DIR" -type f | wc -l) files
EOF

echo "✅ Backup complete! Created in: $BACKUP_DIR"
echo "📋 See $BACKUP_DIR/backup-info.txt for details" 