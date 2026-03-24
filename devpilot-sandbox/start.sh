#!/bin/bash
# Enable verbose tracing for Cloud Run logs
set -x

export PORT="${PORT:-8080}"
export DISPLAY="${DISPLAY:-:1}"
export WS_PORT="${WS_PORT:-6080}"
export HOME=/home/devpilot

echo "--- DevPilot Sandbox Startup Diagnostics ---"
echo "Current User: $(whoami)"
echo "Environment: PORT=$PORT, DISPLAY=$DISPLAY, WS_PORT=$WS_PORT"

# 1. Setup KasmVNC auth database if it doesn't exist
mkdir -p "$HOME/.vnc"

# We check for both kasmvncuser and kasmvncadduser
USER_CMD=""
if command -v kasmvncadduser >/dev/null 2>&1; then
    USER_CMD="kasmvncadduser"
elif command -v kasmvncuser >/dev/null 2>&1; then
    USER_CMD="kasmvncuser"
elif [ -f "/usr/share/kasmvnc/bin/kasmvncadduser" ]; then
    USER_CMD="/usr/share/kasmvnc/bin/kasmvncadduser"
fi

if [ -n "$USER_CMD" ]; then
    echo "Creating KasmVNC user via $USER_CMD..."
    $USER_CMD -u devpilot -p devpilot -w || echo "User might already exist"
else
    echo "WARNING: User management tool not found. KasmVNC might prompt for user creation."
fi

# 2. Generate kasmvnc.yaml
# We ensure it hits the right port and stays functional
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

# Setup xstartup
cat << 'EOF' > "$HOME/.vnc/xstartup"
#!/bin/sh
fluxbox &
EOF
chmod +x "$HOME/.vnc/xstartup"

# 3. Start KasmVNC
echo "Starting KasmVNC..."
# We use nohup and redirect logs to stdout/stderr
# -disableHttpAuth allows the Express proxy to reach it without any prompt
nohup kasmvncserver $DISPLAY -depth 24 -geometry 1440x950 -disableHttpAuth > /tmp/kasmvnc.log 2>&1 &

# 4. Wait for X server or logs
sleep 5
echo "--- KasmVNC Startup Logs ---"
[ -f /tmp/kasmvnc.log ] && cat /tmp/kasmvnc.log

# 5. Start Node.js API server
echo "Starting Node.js server on port $PORT..."
# Tailing KasmVNC log in background
tail -f /tmp/kasmvnc.log &

# Final process (Node.js) must be in foreground
node dist/index.js
