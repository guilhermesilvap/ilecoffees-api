#!/bin/bash
# Roda UMA VEZ no servidor para instalar tudo
set -e

echo "===> Atualizando o sistema..."
apt-get update -y && apt-get upgrade -y

echo "===> Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "===> Instalando PM2, Nginx e PostgreSQL..."
npm install -g pm2
apt-get install -y nginx postgresql postgresql-contrib

echo "===> Configurando PostgreSQL..."
DB_PASSWORD=$(openssl rand -hex 16)
sudo -u postgres psql -c "CREATE USER ilecoffees WITH PASSWORD '${DB_PASSWORD}';"
sudo -u postgres psql -c "CREATE DATABASE ilecoffees_db OWNER ilecoffees;"

echo ""
echo "================================================================"
echo "  ANOTA ESSA SENHA DO BANCO — você vai precisar no .env:"
echo "  DB_PASSWORD=${DB_PASSWORD}"
echo "================================================================"
echo ""

echo "===> Criando usuário de deploy..."
useradd -m -s /bin/bash deploy 2>/dev/null || echo "Usuário deploy já existe"
usermod -aG sudo deploy

echo "===> Clonando repositório..."
cd /home/deploy
git clone https://github.com/guilhermesilvap/ilecoffees-api.git app || true
chown -R deploy:deploy /home/deploy/app

echo "===> Configurando Nginx..."
cat > /etc/nginx/sites-available/ilecoffees << 'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    client_max_body_size 20M;

    root /home/app/ilecoffees-web/dist;
    index index.html;

    # index.html nunca cacheado — força browser a buscar versão nova
    location = /index.html {
        add_header Cache-Control "no-store, no-cache, must-revalidate";
        try_files $uri /index.html;
    }

    # Arquivos com hash (JS/CSS) — cache longo, Vite garante nome novo a cada build
    location ~* \.(js|css|woff2?|ttf|svg|png|jpg|jpeg|gif|ico|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3333/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/ilecoffees /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "===> Configurando firewall..."
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable

echo ""
echo "================================================================"
echo "  Setup concluído!"
echo "  Próximo passo: configure o .env e rode ./scripts/deploy.sh"
echo "================================================================"
