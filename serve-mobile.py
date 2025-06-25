#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8082
Handler = http.server.SimpleHTTPRequestHandler

print(f"Starting server on all interfaces at port {PORT}")
print(f"Access from your mobile device at:")
print(f"  http://192.168.1.234:{PORT}")
print("\nPress Ctrl+C to stop")

with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    httpd.serve_forever()