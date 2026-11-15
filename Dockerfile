# syntax=docker/dockerfile:1
#
# Runtime image (does NOT compile inside the image): installs only common tools and
# drops in a **precompiled single Linux binary**. The binary is cross-compiled by CI's
# binaries job (pure Go, no QEMU) and placed per target architecture at
# dist/<TARGETARCH>/cyfind in the build context. This way, for multi-arch builds arm64
# only has to emulate the apt layer and no longer emulates the Next/Go compile, which
# is much faster.
#
# To build the image manually in local, prepare the binary yourself first:
#   cd web && npm run build:static && cd ..
#   cp -r web/out server/webui/dist
#   CGO_ENABLED=0 GOARCH=amd64 go build -tags embedui -o dist/amd64/cyfind ./cmd/cyfind
#   docker build -t cyfind:local .
FROM python:3.12-slim-bookworm
ARG TARGETARCH
# Common tools: ripgrep / curl / vim, plus a batch of recon staples (add/remove as needed).
# Install Node 20.x from NodeSource: bookworm's bundled apt nodejs is 18, but Playwright requires >=20.
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates ripgrep curl wget vim git jq unzip \
      dnsutils iputils-ping netcat-openbsd inetutils-telnet whois nmap \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*
# Preinstall Playwright MCP and CLI (globally) so that at runtime there is no npx network download.
# @playwright/mcp: run the browser MCP directly with `npx @playwright/mcp` (already globally installed, no -y/@latest needed).
# @playwright/cli: provides playwright-cli; verify it is executable with --help right after install.
# Then install playwright (provides browser management) and use --with-deps to preprovision chromium
# and its system dependencies, so MCP/CLI inside the container works on first launch without downloading the browser over the network.
RUN npm install -g @playwright/mcp@latest @playwright/cli@latest playwright@latest \
    && playwright-cli --help \
    && playwright install --with-deps chromium \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# Precompiled binary for the matching architecture (dist/amd64/cyfind or dist/arm64/cyfind)
COPY dist/${TARGETARCH}/cyfind /app/cyfind
# Supervisor startup script: after the process exits, it decides whether to relaunch based on the
# exit code; the one-click update from the page relies on it to swap binaries.
# It is also responsible for forwarding SIGTERM to cyfind -- docker stop only sends the signal to PID 1,
# and without forwarding cyfind would not receive it, could not shut down gracefully, and would be hard-killed by SIGKILL after 10 seconds.
COPY start.sh /app/start.sh
RUN chmod +x /app/cyfind /app/start.sh
COPY skills/ /app/skills/
# data/ (SQLite + jwt.key) persistence point
VOLUME ["/app/data"]
EXPOSE 8787 8788
ENTRYPOINT ["/app/start.sh"]
CMD ["-addr", ":8787", "-proxy", ":8788"]
