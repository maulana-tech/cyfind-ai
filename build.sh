#!/usr/bin/env bash
# CYFIND cross-platform release builder.
#
# The default mode builds one target and embeds the already-exported frontend.
# `./build.sh --release` builds and packages all supported desktop/server targets.
#
# Environment variables:
#   CYFIND_TARGET_OS=linux             One target OS in single-target mode.
#   CYFIND_TARGET_ARCH=amd64           One target arch in single-target mode.
#   CYFIND_TARGETS=linux/amd64,...     Comma-separated targets for multi-target mode.
#   CYFIND_BUILD_VERSION=v0.3.3        Version embedded in the binary and archive name.
#   CYFIND_OUTPUT=/path/to/cyfind       Explicit binary path in single-target mode.
#   CYFIND_OUTPUT_DIR=dist             Directory for default binary paths.
#   CYFIND_PACKAGE=1                   Create a zip archive for each target.
#   CYFIND_PACKAGE_DIR=dist            Directory for release archives.
#   CYFIND_COMPRESS=off                UPX mode: off, auto, or required.
#   CYFIND_UPX_ARGS="--best --lzma"    Arguments passed to UPX.
#   CYFIND_SKIP_FRONTEND=1             Reuse server/webui/dist (for CI artifact builds).
#   CYFIND_SKIP_NPM_CI=1               Skip npm ci while rebuilding the frontend.
#   CYFIND_GOSUMDB=sum.golang.org      Go checksum database.
set -euo pipefail

cd "$(cd "$(dirname "$0")" && pwd)"

info() { printf '\033[36m[*]\033[0m %s\n' "$*"; }
ok() { printf '\033[32m[+]\033[0m %s\n' "$*"; }
warn() { printf '\033[33m[!]\033[0m %s\n' "$*" >&2; }
die() { printf '\033[31m[x]\033[0m %s\n' "$*" >&2; exit 1; }

usage() {
  cat <<'EOF'
Usage:
  ./build.sh                         Build for the current OS/arch
  ./build.sh --target linux/amd64   Build one specific target
  ./build.sh --release               Build and package all supported targets

Options:
  --release              Build amd64/arm64 targets for Linux, macOS, Windows and produce zips
  --target OS/ARCH       Set a single target, e.g. windows/amd64
  --upx                  Force UPX binary compression (may affect compatibility on some Linux environments)
  --no-compress          Do not use UPX; only use Go linker stripping and zip compression
  --help                 Show help

The multi-target list can be overridden via CYFIND_TARGETS, e.g.:
  CYFIND_TARGETS=linux/amd64,windows/amd64 ./build.sh --release
EOF
}

RELEASE_TARGETS_DEFAULT="linux/amd64,linux/arm64,darwin/amd64,darwin/arm64,windows/amd64"
CYFIND_RELEASE="${CYFIND_RELEASE:-0}"
CYFIND_COMPRESS="${CYFIND_COMPRESS:-off}"
CYFIND_PACKAGE="${CYFIND_PACKAGE:-0}"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --release)
      CYFIND_RELEASE=1
      CYFIND_PACKAGE=1
      shift
      ;;
    --target)
      [ "$#" -ge 2 ] || die "--target requires an OS/ARCH argument"
      target_arg="$2"
      case "$target_arg" in
        */*)
          CYFIND_TARGET_OS="${target_arg%%/*}"
          CYFIND_TARGET_ARCH="${target_arg##*/}"
          CYFIND_TARGETS="$target_arg"
          ;;
        *) die "Target must be OS/ARCH, e.g. linux/amd64" ;;
      esac
      shift 2
      ;;
    --no-compress)
      CYFIND_COMPRESS=0
      shift
      ;;
    --upx)
      CYFIND_COMPRESS=required
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *) die "Unknown argument: $1 (use --help for usage)" ;;
  esac
done

command -v go >/dev/null 2>&1 || die "Go not detected (the project requires Go 1.26 or higher)"

CYFIND_GOSUMDB="${CYFIND_GOSUMDB:-sum.golang.org}"
if [ -z "${CYFIND_BUILD_VERSION:-}" ]; then
  if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    CYFIND_BUILD_VERSION="$(git describe --tags --always --dirty)"
  else
    CYFIND_BUILD_VERSION="dev"
  fi
fi
# Release tags are commonly passed as v0.3.3; keep the binary version consistent.
CYFIND_BUILD_VERSION="${CYFIND_BUILD_VERSION#v}"
CYFIND_OUTPUT_DIR="${CYFIND_OUTPUT_DIR:-dist}"
CYFIND_PACKAGE_DIR="${CYFIND_PACKAGE_DIR:-$CYFIND_OUTPUT_DIR}"
CYFIND_UPX_ARGS="${CYFIND_UPX_ARGS:---best --lzma}"

if [ "${CYFIND_RELEASE}" = "1" ]; then
  CYFIND_TARGETS="${CYFIND_TARGETS:-$RELEASE_TARGETS_DEFAULT}"
else
  CYFIND_TARGET_OS="${CYFIND_TARGET_OS:-$(GOSUMDB="$CYFIND_GOSUMDB" go env GOOS)}"
  CYFIND_TARGET_ARCH="${CYFIND_TARGET_ARCH:-$(GOSUMDB="$CYFIND_GOSUMDB" go env GOARCH)}"
  CYFIND_TARGETS="${CYFIND_TARGETS:-${CYFIND_TARGET_OS}/${CYFIND_TARGET_ARCH}}"
fi

if [ "${CYFIND_SKIP_FRONTEND:-0}" = "1" ]; then
  [ -d server/webui/dist ] || die "CYFIND_SKIP_FRONTEND=1 but server/webui/dist does not exist"
else
  command -v npm >/dev/null 2>&1 || die "npm not detected (the frontend static build requires Node.js/npm)"
  command -v rsync >/dev/null 2>&1 || die "rsync not detected"
  info "Building frontend static assets"
  if [ "${CYFIND_SKIP_NPM_CI:-0}" != "1" ]; then
    (cd web && npm ci)
  fi
  (cd web && npm run build:static)
  info "Syncing frontend assets to server/webui/dist"
  mkdir -p server/webui/dist
  rsync -a --delete web/out/ server/webui/dist/
fi

compress_binary() {
  binary="$1"
  goos="$2"
  case "$CYFIND_COMPRESS" in
    0|off|false|none)
      info "Skipping UPX: $binary"
      return 0
      ;;
    auto|required|true|1) ;;
    *) die "CYFIND_COMPRESS must be off, auto, or required" ;;
  esac

  if ! command -v upx >/dev/null 2>&1; then
    if [ "$CYFIND_COMPRESS" = "required" ]; then
      die "CYFIND_COMPRESS=required but upx not detected"
    fi
    warn "upx not detected, keeping the linker-compressed result: $binary"
    return 0
  fi

  before=$(wc -c < "$binary" | tr -d ' ')
  upx_args="$CYFIND_UPX_ARGS"
  [ "$goos" = "darwin" ] && upx_args="$upx_args --force-macos"
  # shellcheck disable=SC2086
  if ! upx $upx_args -- "$binary"; then
    if [ "$CYFIND_COMPRESS" = "required" ]; then
      die "UPX compression failed: $binary"
    fi
    warn "UPX does not support this target format, keeping the uncompressed binary: $binary"
    return 0
  fi
  after=$(wc -c < "$binary" | tr -d ' ')
  ok "UPX compression complete: $binary (${before} -> ${after} bytes)"
}

package_binary() {
  binary="$1"
  goos="$2"
  goarch="$3"
  package_name="cyfind-${CYFIND_BUILD_VERSION}-${goos}-${goarch}"
  package_root="${CYFIND_PACKAGE_DIR}/${package_name}"
  archive="${CYFIND_PACKAGE_DIR}/${package_name}.zip"

  command -v zip >/dev/null 2>&1 || die "Packaging requires zip"
  rm -rf "$package_root" "$archive"
  mkdir -p "$package_root"
  cp "$binary" "$package_root/"
  # The watchdog launcher script is the official entry point: the one-click update in the UI relies on
  # it to relaunch the process after it exits. Running the cyfind binary directly means it never comes
  # back up after an update. Ship only the one matching the target OS.
  if [ "$goos" = "windows" ]; then
    cp start.bat "$package_root/"
  else
    cp start.sh "$package_root/"
    chmod +x "$package_root/start.sh"
  fi
  cp -R skills "$package_root/"
  cp config.example.json "$package_root/"
  if [ -f README.md ]; then cp README.md "$package_root/"; fi
  (cd "$CYFIND_PACKAGE_DIR" && zip -q -r -9 "$(basename "$archive")" "$(basename "$package_root")")
  rm -rf "$package_root"
  ok "Release archive: $archive"
}

build_target() {
  target="$1"
  case "$target" in
    */*) ;;
    *) die "Invalid target: $target (must be OS/ARCH)" ;;
  esac
  goos="${target%%/*}"
  goarch="${target##*/}"
  case "$goos" in
    linux|darwin|windows) ;;
    *) die "Unsupported OS: $goos (supported: linux, darwin, windows)" ;;
  esac

  binary_name="cyfind"
  [ "$goos" = "windows" ] && binary_name="cyfind.exe"
  if [ -n "${CYFIND_OUTPUT:-}" ] && [ "$CYFIND_RELEASE" != "1" ]; then
    output="$CYFIND_OUTPUT"
  else
    output="${CYFIND_OUTPUT_DIR}/cyfind-${goos}-${goarch}/${binary_name}"
  fi
  mkdir -p "$(dirname "$output")"

  info "Building ${goos}/${goarch}, version ${CYFIND_BUILD_VERSION}"
  GOSUMDB="$CYFIND_GOSUMDB" \
  CGO_ENABLED=0 \
  GOOS="$goos" \
  GOARCH="$goarch" \
  go build \
    -tags embedui \
    -trimpath \
    -ldflags "-s -w -buildid= -X main.version=${CYFIND_BUILD_VERSION}" \
    -o "$output" \
    ./cmd/cyfind

  compress_binary "$output" "$goos"
  if command -v file >/dev/null 2>&1; then file "$output"; fi
  if [ "$CYFIND_PACKAGE" = "1" ]; then package_binary "$output" "$goos" "$goarch"; fi
  ok "Build complete: $output"
}

write_checksums() {
  [ "$CYFIND_PACKAGE" = "1" ] || return 0
  checksum_file="$CYFIND_PACKAGE_DIR/SHA256SUMS"
  if command -v sha256sum >/dev/null 2>&1; then
    (cd "$CYFIND_PACKAGE_DIR" && for archive in *.zip; do sha256sum "$archive"; done > "$(basename "$checksum_file")")
  elif command -v shasum >/dev/null 2>&1; then
    (cd "$CYFIND_PACKAGE_DIR" && for archive in *.zip; do shasum -a 256 "$archive"; done > "$(basename "$checksum_file")")
  else
    warn "Neither sha256sum nor shasum detected, skipping SHA256SUMS"
    return 0
  fi
  ok "Checksum file: $checksum_file"
}

mkdir -p "$CYFIND_OUTPUT_DIR"
if [ "$CYFIND_PACKAGE" = "1" ]; then mkdir -p "$CYFIND_PACKAGE_DIR"; fi

old_ifs="$IFS"
IFS=','
read -r -a targets <<< "$CYFIND_TARGETS"
IFS="$old_ifs"
[ "${#targets[@]}" -gt 0 ] || die "CYFIND_TARGETS cannot be empty"
for target in "${targets[@]}"; do
  target="${target//[[:space:]]/}"
  [ -n "$target" ] || continue
  build_target "$target"
done

if [ "$CYFIND_PACKAGE" = "1" ]; then
  write_checksums
  info "Release packages generated in: $CYFIND_PACKAGE_DIR"
fi
