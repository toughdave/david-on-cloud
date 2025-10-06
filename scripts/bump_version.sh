#!/usr/bin/env bash
set -e

if [ -f VERSION ]; then
  CURRENT_VERSION=$(cat VERSION)
else
  CURRENT_VERSION="0.0.0"
fi

IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
((PATCH++))
NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"

echo "$NEW_VERSION" > VERSION

git add VERSION
git commit -m "Auto bump version to v$NEW_VERSION"
git tag "v$NEW_VERSION"
git push origin main
git push origin --tags

echo "✅ Auto-bumped to v$NEW_VERSION"
