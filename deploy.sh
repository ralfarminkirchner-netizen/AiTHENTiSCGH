#!/bin/bash
git config --global init.defaultBranch main
git init
git add .
git commit -m "Initial commit of MyCeL V2 Next.js 3D Force Graph"

if command -v gh &> /dev/null
then
    echo "Creating GitHub repo..."
    gh repo create mycel-web --public --source=. --remote=origin --push || echo "GitHub push failed"
else
    echo "gh CLI not found."
fi

if command -v railway &> /dev/null
then
    echo "Deploying to Railway..."
    railway init -n mycel-web || true
    railway up -d || true
else
    echo "railway CLI not found."
fi
