#!/bin/bash
# Roda no servidor a cada novo deploy
set -e

APP_DIR="/home/app"
API_DIR="$APP_DIR/ilecoffees-api"
WEB_DIR="$APP_DIR/ilecoffees-web"

echo "===> Puxando código mais recente..."
cd "$APP_DIR"
git pull origin main

echo "===> Build e deploy da API..."
cd "$API_DIR"
npm install
npm run build
npx prisma migrate deploy

echo "===> Build do frontend..."
cd "$WEB_DIR"
npm install
npm run build

echo "===> Reiniciando API..."
pm2 restart ilecoffees-api 2>/dev/null || pm2 start "$API_DIR/build/server.js" --name ilecoffees-api
pm2 save

echo "===> Recarregando Nginx..."
nginx -t && systemctl reload nginx

echo ""
echo "================================================================"
echo "  Deploy concluído! Site disponível em: http://$(curl -s ifconfig.me)"
echo "================================================================"
