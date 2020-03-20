#!/bin/bash
# -n for testing updates
gsutil rsync -d -r -x ".history/|.gitignore|.git/|node_modules/|server/|.env|.env.example|package.json|yarn.lock|yarn-error.log|upload.sh" . gs://www.0cashtoclose.com
