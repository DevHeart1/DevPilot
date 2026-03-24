export PORT="${PORT:-8080}"
export DISPLAY="${DISPLAY:-:1}"
export WS_PORT="${WS_PORT:-6080}"
export HOME=/root

echo "--- DevPilot Sandbox Startup Diagnostics ---"
echo "Current User: $(whoami)"
echo "Environment: PORT=$PORT, DISPLAY=$DISPLAY, WS_PORT=$WS_PORT"
echo "Working Dir: $(pwd)"

# 1. Verify KasmVNC is installed and runnable
if command -v kasmvncserver >/dev/null 2>&1; then
    echo "KasmVNC check: $(kasmvncserver --version 2>&1)"
else
    echo "ERROR: kasmvncserver not found in PATH!"
    exit 1
fi

# 2. Setup KasmVNC environment
mkdir -p ~/.vnc
echo -e "devpilot\ndevpilot\nn\n" | vncpasswd -f > ~/.vnc/passwd
chmod 600 ~/.vnc/passwd

# Generate a more complete kasmvnc.yaml
# We ensure it hits the right port and stays quiet but functional
cat << EOF > ~/.vnc/kasmvnc.yaml
network:
  protocol: ipv4
  interface: 0.0.0.0
  websocket_port: ${WS_PORT}
  use_ipv4: true
  use_ipv6: false
  ssl:
    require_ssl: false
EOF

# Setup xstartup
cat << 'EOF' > ~/.vnc/xstartup
#!/bin/sh
fluxbox &
EOF
chmod +x ~/.vnc/xstartup

# 3. Start KasmVNC (Provides X server, VNC, WebSocket, and Web Client)
echo "Starting KasmVNC on port $WS_PORT and DISPLAY $DISPLAY..."
# We use nohup and redirect logs to stdout/stderr so they show up in Cloud Run
# -disableHttpAuth allows the Express proxy to reach it easily
nohup kasmvncserver $DISPLAY -depth 24 -geometry 1440x950 -disableHttpAuth > /tmp/kasmvnc.log 2>&1 &

# 4. Wait for X server to be ready
echo "Waiting for X server on $DISPLAY..."
MAX_RETRIES=10
COUNT=0
until xset -q -display $DISPLAY > /dev/null 2>&1 || [ $COUNT -eq $MAX_RETRIES ]; do
    echo "Still waiting ($COUNT/$MAX_RETRIES)..."
    sleep 1
    COUNT=$((COUNT + 1))
done

if [ $COUNT -eq $MAX_RETRIES ]; then
    echo "WARNING: X server did not become ready in time. KasmVNC logs:"
    cat /tmp/kasmvnc.log
else
    echo "X server is UP."
fi

# 5. Start Node.js API server
echo "Starting Node.js server on port $PORT..."
# Tailing the KasmVNC log in the background can help with debugging Cloud Run logs
tail -f /tmp/kasmvnc.log &

# Final process in foreground
node dist/index.js
