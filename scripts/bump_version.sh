#!/usr/bin/env bash
# set -e

# Args
DRY_RUN=0
PRESET_TYPE=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        --dry-run)
            DRY_RUN=1
            shift
            ;;
        --type)
            PRESET_TYPE="$2"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

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

# Function to check if Groq API key is available
check_groq() {
    if [ -z "${GROQ_API_KEY:-}" ]; then
        echo "⚠️  GROQ_API_KEY not set — skipping AI release notes" 1>&2
        return 1
    fi
    # Quick auth check
    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer ${GROQ_API_KEY}" \
        "https://api.groq.com/openai/v1/models" 2>/dev/null)
    if [ "$status" != "200" ]; then
        echo "⚠️  Groq API returned HTTP ${status} — skipping AI release notes" 1>&2
        return 1
    fi
    return 0
}

# Function to generate update summary using Groq (free tier, OpenAI-compatible)
generate_ai_updates() {
    local current_version=$1
    local recent_commits=$2
    local files_changed=$3
    
    local prompt="You are preparing concise release notes for a portfolio website. Based on the recent Git commit subjects and changed files below, output 3-7 short bullet points describing what changed in plain language.

Recent commit subjects (latest first):
$recent_commits

Files changed in this release:
$files_changed

Version being released: v$current_version

Requirements:
- Start each line with '- ✅ '
- Describe tangible changes (UI tweaks, bug fixes, scripts, docs)
- Avoid mentioning AI, LLMs, models, prompts, or tooling
- Keep each bullet under 80 characters
- No code blocks or prose outside of bullets
"

    # Build JSON payload safely via Python to avoid shell escaping issues
    local json_payload
    json_payload=$(python3 -c "
import json, sys
prompt = sys.stdin.read()
print(json.dumps({
    'model': '${GROQ_MODEL:-llama-3.3-70b-versatile}',
    'messages': [{'role': 'user', 'content': prompt}],
    'temperature': 0.7,
    'top_p': 0.9,
    'max_tokens': 400
}))
" <<< "$prompt" 2>/dev/null)

    local ai_response
    ai_response=$(curl -s -X POST "https://api.groq.com/openai/v1/chat/completions" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${GROQ_API_KEY}" \
        -d "$json_payload" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ ! -z "$ai_response" ]; then
        # Extract the response text from JSON (OpenAI chat completions format)
        local update_text
    update_text=$(echo "$ai_response" | python3 -c "
import sys
import json
import re
try:
    data = json.load(sys.stdin)
    response = data.get('choices', [{}])[0].get('message', {}).get('content', '')
    # Clean up the response - extract only bullet points, remove AI/tool mentions
    lines = response.split('\n')
    bullets = []
    for line in lines:
        line = line.strip()
    # Skip fences and metadata (detect code fences without literal backticks)
        if (line[:3] == (chr(96)*3)) or not line:
            continue
    # Only accept bullet-like lines
        if line.startswith('-') or line.startswith('•') or line.startswith('✅'):
            # Normalize prefix
            if not line.startswith('- ✅'):
                if line.startswith('- '):
                    line = '- ✅ ' + line[2:]
                elif line.startswith('✅'):
                    line = '- ✅ ' + line.lstrip('✅').lstrip(' -:')
                elif line.startswith('•'):
                    line = '- ✅ ' + line.lstrip('•').lstrip(' -:')
            # Filter out mentions of AI/LLM/tools or release-notes/doc-only chatter
            low = line.lower()
            # Drop lines that mention AI/LLM/tools via token boundary regex
            if re.search(r'(^|[^a-z])ai([^a-z]|$)', low):
                continue
            if any(x in low for x in [' llm', 'ollama', 'model', 'prompt', 'assistant', 'chatgpt', 'gpt']):
                continue
            # Drop lines about release notes/docs maintenance
            if 'release notes' in low or low.startswith('docs') or 'documentation' in low:
                continue
            bullets.append(line)
    
    # If we got good bullet points, use them
    if bullets:
        print('\n'.join(bullets[:7]))  # Max 7 bullets
    else:
        # No usable bullets; print nothing so caller can fallback
        pass
except:
    # On JSON parse errors, print nothing; caller will fallback
    pass
" 2>/dev/null)
        
        if [ ! -z "$update_text" ]; then
            echo "$update_text"
        else
            # Final fallback handled below using commit subjects
            :
        fi
    else
        # Silent failure; caller will fallback
        :
    fi
}

# Read current version
if [ -f VERSION ]; then
  CURRENT_VERSION=$(cat VERSION)
  echo "📍 Current version: $CURRENT_VERSION"
else
  CURRENT_VERSION="0.0.0"
  echo "📍 No VERSION file found, starting from $CURRENT_VERSION"
fi

# Parse current version
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

if [ -n "$PRESET_TYPE" ]; then
    case "$PRESET_TYPE" in
        major|Major|MAJOR|1)
            ((MAJOR++)); MINOR=0; PATCH=0; NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"; BUMP_TYPE="major"; echo "🔥 Selected: Major version bump (from --type)";;
        minor|Minor|MINOR|2)
            ((MINOR++)); PATCH=0; NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"; BUMP_TYPE="minor"; echo "✨ Selected: Minor version bump (from --type)";;
        patch|Patch|PATCH|3)
            ((PATCH++)); NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"; BUMP_TYPE="patch"; echo "🐛 Selected: Patch version bump (from --type)";;
        *)
            echo "❌ Invalid --type value: $PRESET_TYPE (use major|minor|patch)"; exit 1;;
    esac
else
    # Interactive version bump selection
    echo ""
    echo "🎯 Choose version bump type:"
    echo "   1) 🔥 Major (${MAJOR}.x.x → $((MAJOR + 1)).0.0) - Breaking changes, major features"
    echo "   2) ✨ Minor (${MAJOR}.${MINOR}.x → ${MAJOR}.$((MINOR + 1)).0) - New features, backwards compatible"
    echo "   3) 🐛 Patch (${MAJOR}.${MINOR}.${PATCH} → ${MAJOR}.${MINOR}.$((PATCH + 1))) - Bug fixes, minor improvements"
    echo ""
    while true; do
        read -p "💬 Select bump type [1-3]: " bump_choice
        case $bump_choice in
            1|major|Major|MAJOR)
                ((MAJOR++)); MINOR=0; PATCH=0; NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"; BUMP_TYPE="major"; echo "🔥 Selected: Major version bump"; break;;
            2|minor|Minor|MINOR)
                ((MINOR++)); PATCH=0; NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"; BUMP_TYPE="minor"; echo "✨ Selected: Minor version bump"; break;;
            3|patch|Patch|PATCH)
                ((PATCH++)); NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"; BUMP_TYPE="patch"; echo "🐛 Selected: Patch version bump"; break;;
            "")
                ((PATCH++)); NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"; BUMP_TYPE="patch"; echo "🐛 Default: Patch version bump (Enter pressed)"; break;;
            *) echo "❌ Invalid choice. Please enter 1, 2, or 3 (or major, minor, patch)";;
        esac
    done
fi

echo "DEBUG: Version bump selection complete. Continuing script..."

echo ""
echo "🚀 Bumping version from $CURRENT_VERSION to $NEW_VERSION ($BUMP_TYPE)"

# Confirmation prompt (auto-confirm in dry-run)
echo ""
if [ "$DRY_RUN" -eq 1 ]; then
    echo "🔎 Dry run: auto-confirmed"
else
    if ! read -p "✅ Proceed with version bump to v$NEW_VERSION? [Y/n]: " confirm; then
        confirm="Y"
    fi
    case $confirm in
        [Nn]* ) echo "❌ Version bump cancelled"; exit 0;;
        * ) echo "🎯 Proceeding with version bump...";;
    esac
fi

# Find last version tag (if any)
LAST_TAG=$(git tag --sort=-creatordate | head -n 1)
if [ -z "$LAST_TAG" ]; then
    # No previous tag, use all history
    RECENT_COMMITS=$(git log --oneline --pretty=format:"%s" | head -10)
    FILES_CHANGED=$(git diff --name-only HEAD)
else
    RECENT_COMMITS=$(git log --oneline "${LAST_TAG}..HEAD" --pretty=format:"%s" | head -10)
    FILES_CHANGED=$(git diff --name-only "${LAST_TAG}..HEAD")
fi
if [ -z "$FILES_CHANGED" ]; then
    FILES_CHANGED="No file changes detected"
fi

# Generate update summary (prefer Ollama, with sanitized output; fallback to commits)
UPDATE_SUMMARY=""
# Determine desired bullet count based on scope of change
NUM_COMMITS=$(echo "$RECENT_COMMITS" | grep -c . || true)
NUM_FILES=$(echo "$FILES_CHANGED" | grep -c . || true)
TOTAL_HINTS=$(( NUM_COMMITS + NUM_FILES ))
DESIRED_COUNT=1
if [ $TOTAL_HINTS -le 1 ]; then
    DESIRED_COUNT=1
elif [ $TOTAL_HINTS -le 3 ]; then
    DESIRED_COUNT=3
elif [ $TOTAL_HINTS -le 5 ]; then
    DESIRED_COUNT=5
else
    DESIRED_COUNT=7
fi
if check_groq; then
    UPDATE_SUMMARY=$(generate_ai_updates "$NEW_VERSION" "$RECENT_COMMITS" "$FILES_CHANGED")
    if [ -n "$UPDATE_SUMMARY" ]; then
        # Trim empty lines and cap to desired count
        UPDATE_SUMMARY=$(echo "$UPDATE_SUMMARY" | sed '/^$/d' | head -n "$DESIRED_COUNT")
    fi
fi

# Commit-based fallback if empty
if [ -z "$UPDATE_SUMMARY" ]; then
    # Derive bullets from recent commit subjects and sanitize
    CLEAN_COMMITS=$(echo "$RECENT_COMMITS" | sed -E 's/^[0-9a-f]+[[:space:]]+//' )
    # Filter out docs/release-notes only commits; normalize prefixes; remove AI/tool words; tidy spacing
    SAN_COMMITS=$(echo "$CLEAN_COMMITS" \
        | grep -viE '^docs(\(release\))?:' \
        | sed -E 's/^chore\(script\):/Release tooling:/I; s/^feat: /Add: /I; s/^fix: /Fix: /I; s/^chore: /Chore: /I; s/^refactor: /Refactor: /I' \
        | sed -E 's/\b(ai|llm|chatgpt|gpt|ollama|model|prompt)\b//Ig' \
        | sed -E 's/[[:space:]]{2,}/ /g; s/[[:space:]]+$//' )

    # If filtering removed everything, fall back to a single internal maintenance bullet
    if [ -z "$SAN_COMMITS" ]; then
        UPDATE_SUMMARY="- ✅ Internal release tooling updates"
    else
        # Choose desired number of bullets and avoid mid-word cutoffs
        UPDATE_SUMMARY=$(echo "$SAN_COMMITS" \
            | head -n "$DESIRED_COUNT" \
            | awk '{ s=$0; if (length(s)>100) { s=substr(s,1,100); while (length(s)>0 && substr(s,length(s),1)!=" ") s=substr(s,1,length(s)-1); } print "- ✅ " s }')
    fi
    # Ensure we at least mention the version bump
    if [ -z "$UPDATE_SUMMARY" ]; then
        UPDATE_SUMMARY="- ✅ Bumped version to v$NEW_VERSION"
    else
        UPDATE_SUMMARY="$UPDATE_SUMMARY
- ✅ Bumped version to v$NEW_VERSION"
    fi
fi

# Prepare release entry (used for dry-run and actual write)
DATE_STR=$(date +"%Y-%m-%d %H:%M:%S")
NEW_ENTRY="## v$NEW_VERSION — $DATE_STR\n$UPDATE_SUMMARY\n"

# Dry-run preview (skip writes and git)
if [ "$DRY_RUN" -eq 1 ]; then
    echo ""
    echo "==== DRY RUN PREVIEW ===="
    echo "Would write to VERSION: $NEW_VERSION"
    echo "Would update version spans and cache-busting ?v= strings in HTML"
    echo -e "Would prepend to RELEASE_NOTES.txt:\n$NEW_ENTRY"
    echo "========================"
    echo "(No files were modified; no git operations performed)"
    exit 0
fi

# Update VERSION file
echo "$NEW_VERSION" > VERSION

# Update version in HTML files (safely replace only the text inside the span)
sed -i -E "s/(id=\"version-display\">)[^<]*/\1$NEW_VERSION/g" index.html projects.html

# Update cache-busting ?v= query strings on local CSS/JS assets
sed -i -E "s/(\.(css|js))\?v=[0-9]+\.[0-9]+\.[0-9]+/\1?v=$NEW_VERSION/g" index.html projects.html



# --- RELEASE NOTES LOGGING (most recent first) ---
RELEASE_NOTES="RELEASE_NOTES.txt"

# Remove any previous duplicate or empty entries for this version
if [ -f "$RELEASE_NOTES" ]; then
    # Remove any previous entries for this version
    grep -v "^## v$NEW_VERSION " "$RELEASE_NOTES" > "${RELEASE_NOTES}.tmp"
    # Remove excess blank lines
    awk 'NF {p=1} p' "${RELEASE_NOTES}.tmp" > "${RELEASE_NOTES}.bak"
    # Prepend the new entry
    echo -e "$NEW_ENTRY" > "$RELEASE_NOTES"
    cat "${RELEASE_NOTES}.bak" >> "$RELEASE_NOTES"
    rm "${RELEASE_NOTES}.bak" "${RELEASE_NOTES}.tmp"
else
    echo -e "$NEW_ENTRY" > "$RELEASE_NOTES"
fi

echo "✅ Prepended clean release notes to $RELEASE_NOTES"


# Git operations - do not touch README.md
git add VERSION index.html projects.html RELEASE_NOTES.txt
git commit -m "Auto $BUMP_TYPE bump version to v$NEW_VERSION with update summary"

echo "✅ Created commit"

# Create and push tag
git tag "v$NEW_VERSION"
echo "✅ Created tag v$NEW_VERSION"

# Push changes (including the previous unpushed commits)
echo "📤 Pushing all commits and tags to remote..."
git push origin main
git push origin --tags

echo ""
echo "🎉 Successfully bumped to v$NEW_VERSION ($BUMP_TYPE)"
echo "📝 Changes:"
echo "   - VERSION file updated"
echo "   - HTML files updated (version display + cache-busting ?v= strings)"
echo "   - Release notes updated"
echo "   - Git commit created with $BUMP_TYPE bump message"
echo "   - Tag v$NEW_VERSION created and pushed"
echo "   - All local commits pushed to remote"