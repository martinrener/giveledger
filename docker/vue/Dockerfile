FROM node:20-alpine
WORKDIR /app
COPY frontend/.output ./.output
COPY frontend/package.json ./
CMD ["node", ".output/server/index.mjs"]
