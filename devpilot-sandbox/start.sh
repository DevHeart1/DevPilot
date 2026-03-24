#!/bin/bash
# Enable verbose tracing
set -x

export PORT="${PORT:-8080}"
export DISPLAY="${DISPLAY:-:1}"
export WS_PORT="${WS_PORT:-6080}"
export HOME=/home/devpilot

echo "--- DevPilot Sandbox Startup (Consolidated KasmVNC) ---"
echo "Current User: $(whoami)"
echo "Environment: PORT=$PORT, DISPLAY=$DISPLAY"

# 1. Setup VNC Config
mkdir -p "$HOME/.vnc"
cat << EOF > "$HOME/.vnc/kasmvnc.yaml"
network:
  protocol: ipv4
  interface: 0.0.0.0
  websocket_port: ${WS_PORT}
  use_ipv4: true
  use_ipv6: false
  ssl:
    require_ssl: false
EOF

# 2. Start KasmVNC
# KasmVNC (Xvnc) provides the X server for Playwright.
# We bypass the wizard by having pre-configured /etc/kasmvnc/kasmvncauth.db in the image.
echo "Starting KasmVNC on $DISPLAY..."
nohup kasmvncserver $DISPLAY -depth 24 -geometry 1440x950 -disableHttpAuth > /tmp/kasmvnc.log 2>&1 &

# 3. Wait for X server to be ready
echo "Waiting for X server..."
MAX_RETRIES=20
COUNT=0
until xset -q -display $DISPLAY > /dev/null 2>&1 || [ $COUNT -eq $MAX_RETRIES ]; do
    echo "Still waiting for X server ($COUNT/$MAX_RETRIES)..."
    sleep 1
    COUNT=$((COUNT + 1))
done

if [ $COUNT -eq $MAX_RETRIES ]; then
    echo "ERROR: KasmVNC failed to provide X server on $DISPLAY!"
    cat /tmp/kasmvnc.log
    exit 1
fi
echo "X server is UP."

# 4. Start Fluxbox (Window Manager)
echo "Starting Fluxbox..."
fluxbox -display $DISPLAY &

# 5. Start Node.js API server
echo "Starting Node.js server on port $PORT..."
tail -f /tmp/kasmvnc.log &

# Final process - Node will use DISPLAY=:1 for Playwright
node dist/index.js
