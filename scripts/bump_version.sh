#!/usr/bin/env bash
set -e

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a Git repository"
    exit 1
fi

# Check if there are uncommitted changes (working directory only)
if ! git diff --quiet; then
    echo "❌ Error: You have unstaged changes. Please stage and commit them first."
    echo "Run: git add . && git commit -m 'Your commit message'"
    exit 1
fi

# Check if there are staged but uncommitted changes
if ! git diff --staged --quiet; then
    echo "❌ Error: You have staged but uncommitted changes. Please commit them first."
    echo "Run: git commit -m 'Your commit message'"
    exit 1
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Error: No remote origin configured"
    echo "Run: git remote add origin <your-repo-url>"
    exit 1
fi

# Read current version
if [ -f VERSION ]; then
  CURRENT_VERSION=$(cat VERSION)
  echo "📍 Current version: $CURRENT_VERSION"
else
  CURRENT_VERSION="0.0.0"
  echo "📍 No VERSION file found, starting from $CURRENT_VERSION"
fi

# Parse and increment version
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
((PATCH++))
NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"

echo "🚀 Bumping version to: $NEW_VERSION"

# Update VERSION file
echo "$NEW_VERSION" > VERSION

# Update version in HTML files (fallback span content - now fetched dynamically)
sed -i "s/version-display\">.*</version-display\">$NEW_VERSION</g" index.html projects.html

echo "✅ Updated VERSION file and HTML files"

# Git operations
git add VERSION index.html projects.html
git commit -m "Auto bump version to v$NEW_VERSION"

echo "✅ Created commit"

# Create and push tag
git tag "v$NEW_VERSION"
echo "✅ Created tag v$NEW_VERSION"

# Push changes (including the previous unpushed commits)
echo "📤 Pushing all commits and tags to remote..."
git push origin main
git push origin --tags

echo "🎉 Successfully bumped to v$NEW_VERSION"
echo "📝 Changes:"
echo "   - VERSION file updated"
echo "   - HTML files updated (fallback content)"
echo "   - Version now loads dynamically from /VERSION"
echo "   - Git commit created"
echo "   - Tag v$NEW_VERSION created and pushed"
echo "   - All local commits pushed to remote"