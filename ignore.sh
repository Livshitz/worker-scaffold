#!/bin/bash

# Hack: Make sure preinstall runs because Vercel has some problems running it on 'bun install'
bun run preinstall || true

# Get a list of paths from the arguments
paths=("$@")

# Flag to indicate if any path has changes
has_changes=false

# Check for changes in each specified path
for path in "${paths[@]}"
do
    if ! git diff --quiet HEAD^ HEAD -- "$path"
    then
        echo "Changes detected in $path, proceeding with build."
        has_changes=true
    else
        echo "No changes in $path,"
    fi
done

# Exit with status 0 if no changes were detected, 1 otherwise
if $has_changes
then
    exit 1
else
    echo "No changes, skipping..."
    exit 0
fi