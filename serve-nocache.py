#!/usr/bin/env python3
import http.server
import socketserver
from datetime import datetime

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

PORT = 8080
Handler = NoCacheHTTPRequestHandler

print(f"Starting no-cache server on port {PORT}")
print(f"Access at: http://localhost:{PORT}")
print(f"Or from mobile: http://192.168.1.234:{PORT}")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()