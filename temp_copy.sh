#!/bin/bash
cd /tmp
# Download or copy web/out files
# Since we can't use docker cp easily, let's create the structure differently
mkdir -p /app/server/webui/dist
# We'll just recreate the structure manually or use echo
echo "Structure created"
