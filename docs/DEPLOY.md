# Руководство по развертыванию PicoClaw

PicoClaw потребляет всего ~30–50 МБ RAM на Node.js, поэтому его можно запускать на самых доступных VPS (Hetzner, Timeweb, VDSina, DigitalOcean и др.) от 512 МБ / 1 vCPU, а также на домашних серверах и Raspberry Pi / RISC-V SBC.

---

## Вариант 1. Развертывание через Docker & Docker Compose (Рекомендуемый)

### 1. Подготовка сервера
Установите Docker и Docker Compose на ваш VPS:
```bash
# Ubuntu / Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### 2. Клонирование и настройка окружения
```bash
# Скачайте проект или склонируйте репозиторий
cd /opt
git clone <URL_ВАШЕГО_РЕПОЗИТОРИЯ> picoclaw
cd picoclaw

# Создайте файл с переменными окружения
cp .env.example .env
nano .env
```

Впишите параметры:
```env
GEMINI_API_KEY=AIzaSy...
TZ=Europe/Moscow
PORT=3000
```

### 3. Запуск контейнера
```bash
docker compose up -d --build
```

Проверка статуса:
```bash
docker compose ps
docker compose logs -f
```

Интерфейс будет доступен по адресу: `http://IP_ВАШЕГО_СЕРВЕРА:3000`

---

## Вариант 2. Развертывание без Docker (Node.js 22 + PM2)

Если вы хотите запускать процесс напрямую на хосте:

```bash
# 1. Установка Node.js 22 и PM2
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# 2. Клонирование и сборка
git clone <URL_ВАШЕГО_РЕПОЗИТОРИЯ> picoclaw
cd picoclaw
npm install
npm run build

# 3. Запуск в фоне через PM2
export GEMINI_API_KEY="ваш_ключ"
pm2 start dist/server.cjs --name "picoclaw"
pm2 startup
pm2 save
```

---

## Настройка Nginx Reverse Proxy и SSL (HTTPS)

Для привязки своего домена (например, `picoclaw.yourdomain.com`):

```nginx
# /etc/nginx/sites-available/picoclaw
server {
    server_name picoclaw.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Активация сайта и выпуск бесплатного SSL-сертификата Let's Encrypt:
```bash
sudo ln -s /etc/nginx/sites-available/picoclaw /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d picoclaw.yourdomain.com
```

---

## Обновление приложения на сервере

```bash
cd /opt/picoclaw
git pull
docker compose up -d --build
```
