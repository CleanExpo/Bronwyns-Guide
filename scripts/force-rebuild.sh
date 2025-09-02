#!/bin/bash

# Force rebuild on Vercel by adding a timestamp to package.json
echo "Forcing Vercel rebuild..."

# Add a build timestamp to trigger cache invalidation
TIMESTAMP=$(date +%s)
echo "Build timestamp: $TIMESTAMP"

# Create a file that changes on every build
echo "{\"buildTime\": \"$TIMESTAMP\"}" > frontend-new/.build-timestamp.json

echo "Force rebuild triggered!"