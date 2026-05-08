#!/bin/bash

echo "Buscando archivos del sitio web..."
echo ""

echo "=== Buscando index.html ==="
find /var/www -name "index.html" 2>/dev/null
find /home -name "index.html" 2>/dev/null
find /opt -name "index.html" 2>/dev/null

echo ""
echo "=== Buscando carpetas public_html ==="
find / -type d -name "public_html" 2>/dev/null

echo ""
echo "=== Buscando carpetas www ==="
find / -type d -name "www" 2>/dev/null | head -10

echo ""
echo "=== Contenido de /var/www (si existe) ==="
ls -la /var/www/ 2>/dev/null

echo ""
echo "Done!"
