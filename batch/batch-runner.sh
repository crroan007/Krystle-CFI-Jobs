#!/bin/bash
# batch-runner.sh -- Parallel batch processing of job posting URLs
#
# Usage: bash batch/batch-runner.sh [--dry-run] [--parallel N] [--start-from N]
#
# Reads URLs from data/pipeline.md, launches parallel claude workers,
# and merges results into the tracker.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PIPELINE="$PROJECT_ROOT/data/pipeline.md"
STATE_FILE="$SCRIPT_DIR/batch-state.tsv"
PID_FILE="$SCRIPT_DIR/batch-runner.pid"
ADDITIONS_DIR="$SCRIPT_DIR/tracker-additions"
LOGS_DIR="$SCRIPT_DIR/logs"

# Defaults
PARALLEL=3
DRY_RUN=false
START_FROM=1

# Parse args
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true; shift ;;
    --parallel) PARALLEL="$2"; shift 2 ;;
    --start-from) START_FROM="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

# Prevent double execution
if [[ -f "$PID_FILE" ]]; then
  OLD_PID=$(cat "$PID_FILE")
  if kill -0 "$OLD_PID" 2>/dev/null; then
    echo "Batch runner already running (PID $OLD_PID). Exiting."
    exit 1
  fi
  rm -f "$PID_FILE"
fi
echo $$ > "$PID_FILE"
trap 'rm -f "$PID_FILE"' EXIT

# Create directories
mkdir -p "$ADDITIONS_DIR" "$LOGS_DIR"

# Extract pending URLs from pipeline.md
URLS=()
while IFS= read -r line; do
  if [[ "$line" =~ ^-\ \[\ \]\ (.+) ]]; then
    URL="${BASH_REMATCH[1]}"
    URLS+=("$URL")
  fi
done < "$PIPELINE"

TOTAL=${#URLS[@]}
echo "Found $TOTAL pending URLs in pipeline"

if [[ $TOTAL -eq 0 ]]; then
  echo "Nothing to process."
  exit 0
fi

# Read batch prompt template
BATCH_PROMPT=$(cat "$SCRIPT_DIR/batch-prompt.md")

echo "Processing $TOTAL URLs with $PARALLEL parallel workers..."
echo ""

COMPLETED=0
FAILED=0

for ((i=START_FROM-1; i<TOTAL; i++)); do
  URL_LINE="${URLS[$i]}"
  NUM=$((i + 1))

  echo "[$NUM/$TOTAL] $URL_LINE"

  if $DRY_RUN; then
    echo "  (dry-run -- skipping)"
    continue
  fi

  # Launch claude worker (sequential for now -- parallel requires tmux)
  LOG_FILE="$LOGS_DIR/worker-$NUM.log"

  claude -p "$BATCH_PROMPT

---
JOB POSTING TO EVALUATE:
$URL_LINE

Report number: $NUM
Date: $(date +%Y-%m-%d)
---" > "$LOG_FILE" 2>&1 && {
    COMPLETED=$((COMPLETED + 1))
    echo "  Done."
  } || {
    FAILED=$((FAILED + 1))
    echo "  FAILED. See $LOG_FILE"
  }
done

echo ""
echo "=== Batch Complete ==="
echo "Completed: $COMPLETED"
echo "Failed: $FAILED"
echo ""

# Merge tracker additions
if [[ $COMPLETED -gt 0 ]] && ! $DRY_RUN; then
  echo "Merging tracker additions..."
  node "$PROJECT_ROOT/merge-tracker.mjs"
fi
