#!/bin/bash

# Security check script - verifies no secrets are exposed

echo "=== Security Check: Verifying No Secrets Exposed ==="
echo ""

# Check if .env is in git status
if git status --porcelain | grep -q "\.env$"; then
    echo "❌ ERROR: .env file is staged or modified in git!"
    echo "   Run: git reset .env"
    exit 1
else
    echo "✅ .env file is not staged"
fi

# Check if .env is in git history
if git log --all --full-history --source -- .env 2>/dev/null | grep -q "commit"; then
    echo "❌ ERROR: .env file found in git history!"
    echo "   You need to remove it from history immediately"
    exit 1
else
    echo "✅ .env file not in git history"
fi

# Check .gitignore contains .env
if grep -q "^\.env$" .gitignore; then
    echo "✅ .env is in .gitignore"
else
    echo "❌ ERROR: .env not found in .gitignore!"
    exit 1
fi

# Check for potential secrets in staged files
SECRETS=$(git diff --cached | grep -iE "(password|token|key|secret).*=.*[a-zA-Z0-9]{20,}" | grep -v ".example" | grep -v "your_" | grep -v "GITHUB_TOKEN")

if [ ! -z "$SECRETS" ]; then
    echo "⚠️  WARNING: Potential secrets found in staged files:"
    echo "$SECRETS"
    echo ""
    echo "   Review carefully before pushing!"
    exit 1
else
    echo "✅ No obvious secrets in staged files"
fi

# Check for hardcoded API keys in source files
HARDCODED=$(git diff --cached -- '*.ts' '*.tsx' '*.js' '*.jsx' | grep -iE "(apikey|api_key|password|secret).*['\"].*[a-zA-Z0-9]{20,}['\"]" | grep -v "your_" | grep -v "example")

if [ ! -z "$HARDCODED" ]; then
    echo "⚠️  WARNING: Potential hardcoded secrets in source files:"
    echo "$HARDCODED"
    echo ""
    echo "   Remove hardcoded secrets and use environment variables!"
    exit 1
else
    echo "✅ No hardcoded secrets in source files"
fi

echo ""
echo "=== All Security Checks Passed! ==="
echo "Safe to push to GitHub"
