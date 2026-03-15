#!/bin/bash
# Ralph Wiggum Stop Hook
# Blocks Claude from stopping and re-feeds the loop prompt.
# Create a .ralph-stop file in the project root to break the loop.

set -e

INPUT=$(cat)
PROJECT_DIR=$(echo "$INPUT" | jq -r '.cwd')
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active')

# If the loop was already re-triggered, allow this stop so Claude
# doesn't get stuck in an unbreakable inner loop. The outer ralph.sh
# script handles the next full iteration.
if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  exit 0
fi

# Emergency brake — touch .ralph-stop to kill the loop
if [ -f "$PROJECT_DIR/.ralph-stop" ]; then
  rm "$PROJECT_DIR/.ralph-stop"
  exit 0
fi

# Read the loop prompt and feed it back
PROMPT=$(cat "$PROJECT_DIR/.claude/ralph-prompt.md")

echo "{
  \"decision\": \"block\",
  \"reason\": \"$( echo "$PROMPT" | jq -Rs . | sed 's/^"//;s/"$//' )\"
}"

exit 0
