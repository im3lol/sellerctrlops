# Playwright base image ships the matching browsers preinstalled.
FROM mcr.microsoft.com/playwright:v1.49.1-jammy

WORKDIR /app

# Install deps first for layer caching.
COPY package.json ./
RUN npm install --omit=dev

COPY index.js ./

# Headless by default; the worker is a long-running poller.
ENV NODE_ENV=production
CMD ["node", "index.js"]
