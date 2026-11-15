#!/bin/sh
# Cyfind AI watchdog launcher (Linux / macOS / Docker ENTRYPOINT)
#
# Usage:
#   ./start.sh                            run in the foreground (Ctrl-C to stop)
#   nohup ./start.sh >cyfind.log 2>&1 &   run detached in the background
#   ./start.sh -addr :9000                extra args are passed through to cyfind verbatim
#
# It does exactly one thing: run cyfind, then decide from the exit code whether to relaunch it.
#
#   0      user stopped it normally    -> exit the loop
#   75     program requested a restart -> relaunch immediately (the UI clicked "update" or "rollback")
#   other  crash                       -> relaunch after a backoff (1->2->4... up to 60s)
#
# Downloading, SHA256 verification and swapping are deliberately NOT done here: that logic
# would have to be written twice (sh and bat), and it is exactly the part that must never
# fail — once a non-runnable binary is swapped in, this script would faithfully relaunch it
# forever and the user could only rescue the machine by hand. So all verification/swapping
# lives in Go (the selfupdate package), done by cyfind itself at startup, and the script
# stays dumb.
set -u

cd "$(dirname "$0")" || exit 1

BIN=./cyfind
[ -x "$BIN" ] || { echo "[cyfind] executable not found: $BIN" >&2; exit 1; }

RESTART_CODE=75
MAX_DELAY=60

child=0
stopping=0

# Forward stop signals to cyfind itself.
#
# Required under Docker: `docker stop` only sends SIGTERM to PID 1 (this script), not to
# the child. Without forwarding, cyfind never receives the signal, can't shut down
# gracefully, and is hard-killed by SIGKILL after 10s — cutting any running task off
# mid-flight.
forward() {
	stopping=1
	if [ "$child" -ne 0 ]; then
		kill -TERM "$child" 2>/dev/null || true
	fi
}
trap forward INT TERM

delay=1
while :; do
	"$BIN" "$@" &
	child=$!

	# A signal interrupts wait and makes it return >128. At that point the child is still
	# shutting down gracefully, so we must wait once more to get its real exit code.
	wait "$child"
	code=$?
	if [ "$code" -gt 128 ]; then
		wait "$child"
		code=$?
	fi
	child=0

	if [ "$stopping" -eq 1 ]; then
		echo "[cyfind] stopped"
		exit 0
	fi

	case "$code" in
		0)
			echo "[cyfind] exited normally"
			exit 0
			;;
		"$RESTART_CODE")
			# Update/rollback is staged: on relaunch cyfind completes the swap at startup (see selfupdate.Bootstrap).
			echo "[cyfind] restart requested (applying new version)..."
			delay=1
			;;
		*)
			echo "[cyfind] abnormal exit (code=$code), restarting in ${delay}s" >&2
			sleep "$delay"
			delay=$((delay * 2))
			[ "$delay" -gt "$MAX_DELAY" ] && delay=$MAX_DELAY
			;;
	esac
done
