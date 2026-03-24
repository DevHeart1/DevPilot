#!/bin/bash
set -e

# Default port configuration
export PORT="${PORT:-8080}"
export DISPLAY="${DISPLAY:-:1}"
export WS_PORT="${WS_PORT:-6080}"
export KASM_VNC_PATH=/usr/share/kasmvnc

echo "Starting DevPilot Sandbox Service..."

# 1. Setup KasmVNC environment and password
mkdir -p ~/.vnc
# Create a default password for the 'devpilot' user
echo -e "devpilot\ndevpilot\nn\n" | vncpasswd -f > ~/.vnc/passwd
chmod 600 ~/.vnc/passwd

# Generate a minimal kasmvnc.yaml
# We disable SSL for easier proxying in this sandbox environment
cat << EOF > ~/.vnc/kasmvnc.yaml
network:
  protocol: ipv4
  interface: 0.0.0.0
  websocket_port: ${WS_PORT}
  use_ipv4: true
  use_ipv6: false
  ssl:
    require_ssl: false
encoding:
  tight:
    enabled: true
EOF

# 2. Setup xstartup to launch the window manager
cat << 'EOF' > ~/.vnc/xstartup
#!/bin/sh
fluxbox &
EOF
chmod +x ~/.vnc/xstartup

# 3. Start KasmVNC (Provides X server, VNC, WebSocket, and Web Client)
# We run it in the background (&) so the Node.js server can start afterward
echo "Starting KasmVNC on port $WS_PORT and DISPLAY $DISPLAY..."
kasmvncserver $DISPLAY -depth 24 -geometry 1440x950 -disableHttpAuth &

# Allow KasmVNC a moment to initialize the X server
sleep 5

# 4. Start Node.js API server
echo "Starting Node.js server on port $PORT..."
# This process must stay in the foreground for Cloud Run
node dist/index.js
