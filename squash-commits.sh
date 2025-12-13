#!/bin/bash
# Script to squash all commits on current branch

set -e

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $CURRENT_BRANCH"

# Find base branch (main or master)
if git show-ref --verify --quiet refs/heads/main; then
    BASE_BRANCH="main"
elif git show-ref --verify --quiet refs/heads/master; then
    BASE_BRANCH="master"
else
    echo "Error: Could not find main or master branch"
    exit 1
fi

echo "Base branch: $BASE_BRANCH"

# Get the commit count
COMMIT_COUNT=$(git rev-list --count $BASE_BRANCH..HEAD)
echo "Commits to squash: $COMMIT_COUNT"

if [ "$COMMIT_COUNT" -eq 0 ]; then
    echo "No commits to squash"
    exit 0
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "Warning: You have uncommitted changes. Stashing them..."
    git stash
    STASHED=true
else
    STASHED=false
fi

# Reset to base branch but keep all changes staged
git reset --soft $BASE_BRANCH

# Show status
echo ""
echo "All changes are now staged. Ready to create a new commit."
echo "Run: git commit -m 'Your commit message'"
echo ""

if [ "$STASHED" = true ]; then
    echo "Note: You had uncommitted changes that were stashed."
    echo "After committing, run: git stash pop"
fi

