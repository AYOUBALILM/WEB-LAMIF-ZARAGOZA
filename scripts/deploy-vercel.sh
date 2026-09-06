#!/bin/bash
set -e

echo "================================================"
echo "  La Mif — Despliegue en Vercel"
echo "================================================"
echo ""

# ── 0. Verificar CLI ──
if ! npx vercel@latest --version >/dev/null 2>&1; then
    echo "No se pudo acceder a Vercel CLI. Revisa tu conexión."
    exit 1
fi

# ── 1. Login interactivo (abre navegador) ──
echo "📌 Paso 1/6: Login en Vercel (se abrirá el navegador)..."
npx vercel@latest login
echo ""

# ── 2. Vincular proyecto (primera vez crea uno nuevo) ──
echo "📌 Paso 2/6: Vinculando proyecto..."
npx vercel@latest link
echo ""

# ── 3. Variables de entorno ──
echo "📌 Paso 3/6: Configurando variables de entorno..."

npx vercel@latest env add LAMIF_ADMIN_USERNAME production <<< 'admin'
npx vercel@latest env add LAMIF_ADMIN_PASSWORD_HASH production <<< 'dcb08ec8b880c098e2bdb5f5484e3042700a44ba47331786b6ef28deb8c5686da18b1bd5539b3fce7d32b22cf1615c616d8b4f9bce99ac3a3b8eb71ec2e703f7'
npx vercel@latest env add LAMIF_ADMIN_SALT production <<< '39b3dcf23a84d6d833e68978e178de9a8c5fc8861861a8b288a2ca55cd4190fa'
npx vercel@latest env add LAMIF_AUTH_SECRET production <<< '19dd20e0682ed3922e2d94a259fd7f259fadf8a79b6c8a36f64acdb97a4a8e55'
echo ""

# ── 4. Crear Blob Store ──
echo "📌 Paso 4/6: Creando Vercel Blob Store..."
echo "    Se te pedirá un nombre: escribe: lanouvelle"
echo "    Después pedirá confirmación: escribe: y"
echo ""
BLOB_OUTPUT=$(npx vercel@latest blob create-store lanouvelle 2>&1)
echo "$BLOB_OUTPUT"
echo ""

# Extraer token del output
BLOB_TOKEN=$(echo "$BLOB_OUTPUT" | grep -oE 'BLOB_READ_WRITE_TOKEN=[A-Za-z0-9_-]+' | head -1 | cut -d'=' -f2)

if [ -z "$BLOB_TOKEN" ]; then
    echo "⚠ No se pudo extraer el token automáticamente."
    echo "Copia el token de la salida de arriba y pégalo cuando se te pida."
    read -rp "Token de Vercel Blob: " BLOB_TOKEN
fi

npx vercel@latest env add BLOB_READ_WRITE_TOKEN production <<< "$BLOB_TOKEN"
echo ""

# ── 5. Desplegar ──
echo "📌 Paso 5/6: Desplegando..."
npx vercel@latest --prod
echo ""

# ── 6. Credenciales ──
echo "================================================"
echo "  ✅  ¡Despliegue completado!"
echo "================================================"
echo ""
echo "  🌐 Tu web:"
npx vercel@latest ls 2>/dev/null | head -3
echo ""
echo "  🔑 Panel de admin:"
echo "     Usuario:  admin"
echo "     Pass:     Lamifzaz2026"
echo ""
echo "  Panel: reemplaza la URL pública del deploy con: /admin.html"
echo "  Ejemplo: https://TU-PROYECTO.vercel.app/admin.html"
echo ""
