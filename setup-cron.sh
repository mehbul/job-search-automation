#!/bin/bash
# setup-cron.sh
# Adds a cron job that runs the Apify job fetch daily at 8 AM (Mac / Linux).
# Run this once from your terminal.
#
# Usage:
#   chmod +x setup-cron.sh && ./setup-cron.sh
#
# To remove the cron job later:
#   crontab -e   # then delete the career-ops line

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_PATH="$(command -v node)"

if [ -z "$NODE_PATH" ]; then
  echo "ERROR: Node.js not found. Install it from https://nodejs.org and re-run."
  exit 1
fi

CRON_LINE="0 8 * * * $NODE_PATH $SCRIPT_DIR/run-daily.mjs >> $SCRIPT_DIR/batch/logs/daily.log 2>&1"
MARKER="# career-ops daily job fetch"

# Check if already installed
if crontab -l 2>/dev/null | grep -q "career-ops"; then
  echo "Cron job already installed. To edit: crontab -e"
  exit 0
fi

# Append to existing crontab
(crontab -l 2>/dev/null; echo "$MARKER"; echo "$CRON_LINE") | crontab -

echo "✓ Cron job added — runs daily at 8:00 AM."
echo "  To verify: crontab -l"
echo "  Logs will appear in: batch/logs/daily.log"
