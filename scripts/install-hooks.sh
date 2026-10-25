#!/usr/bin/env bash
# Installs a git pre-commit hook that refuses the commit when `redact --check` fails.
set -euo pipefail
cd "$(dirname "$0")/.."
cat > .git/hooks/pre-commit <<'HOOK'
#!/usr/bin/env bash
exec node scripts/redact.mjs --check
HOOK
chmod +x .git/hooks/pre-commit
echo "pre-commit hook installed"
