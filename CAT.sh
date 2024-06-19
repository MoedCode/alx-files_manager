#!/bin/bash

# Find all JavaScript files excluding those in the node_modules directory
find . -type f -name "*.js" ! -path "*/node_modules/*" -print0 | while IFS= read -r -d '' file; do
    echo "==================== $file ===================="
    cat "$file"
    echo ""
done
