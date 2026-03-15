#!/bin/bash
# Ralph Wiggum Loop — outer runner
# Continuously invokes Claude Code with the loop prompt.
# Each iteration gets a fresh context window but picks up progress from the codebase.
#
# Usage:
#   ./ralph.sh                    # Run until you create .ralph-stop
#   ./ralph.sh --max 10           # Run at most 10 iterations
#   ./ralph.sh --max 10 --dangerously-skip-permissions  # Full autonomy (use with caution)
#
# To stop gracefully:
#   touch .ralph-stop

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROMPT_FILE="$SCRIPT_DIR/.claude/ralph-prompt.md"
MAX_ITERATIONS=0
CLAUDE_FLAGS=""
ITERATION=0

# Parse args
while [[ $# -gt 0 ]]; do
  case $1 in
    --max)
      MAX_ITERATIONS="$2"
      shift 2
      ;;
    --dangerously-skip-permissions)
      CLAUDE_FLAGS="$CLAUDE_FLAGS --dangerously-skip-permissions"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

if [ ! -f "$PROMPT_FILE" ]; then
  echo "Error: prompt file not found at $PROMPT_FILE"
  exit 1
fi

PROMPT=$(cat "$PROMPT_FILE")

echo "=== Ralph Wiggum Loop ==="
echo "Prompt: $PROMPT_FILE"
echo "Max iterations: ${MAX_ITERATIONS:-unlimited}"
echo "To stop: touch .ralph-stop"
echo "========================="
echo ""

while true; do
  ITERATION=$((ITERATION + 1))

  # Check iteration cap
  if [ "$MAX_ITERATIONS" -gt 0 ] && [ "$ITERATION" -gt "$MAX_ITERATIONS" ]; then
    echo "[ralph] Hit max iterations ($MAX_ITERATIONS). Stopping."
    break
  fi

  # Check for stop file
  if [ -f "$SCRIPT_DIR/.ralph-stop" ]; then
    echo "[ralph] Found .ralph-stop. Stopping."
    rm "$SCRIPT_DIR/.ralph-stop"
    break
  fi

  echo "[ralph] === Iteration $ITERATION $(date '+%H:%M:%S') ==="

  # Run Claude with the prompt. --print outputs the response to stdout.
  # The stop hook inside .claude/hooks/ handles intra-session looping;
  # this outer loop handles context window resets.
  claude --print $CLAUDE_FLAGS -p "$PROMPT" 2>&1 || true

  echo ""
  echo "[ralph] === Iteration $ITERATION complete ==="
  echo ""

  # Brief pause to avoid hammering the API on fast failures
  sleep 2
done

echo "[ralph] Loop finished after $ITERATION iterations."
