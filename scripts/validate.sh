#!/usr/bin/env bash
set -euo pipefail

node --check src/scripts/script.js
node --check src/services/admin-api.js
node --check src/config/admin-config.js
node --check 'functions/api/[[path]].js'

bash scripts/check-links.sh
node scripts/check-css-braces.js

echo "Validation passed."
