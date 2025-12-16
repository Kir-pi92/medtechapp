FROM node:20-alpine

WORKDIR /app

# Install dependencies first for caching
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Cleanup dev dependencies to reduce image size (optional but good practice)
# RUN npm prune --production

# Environment variables
ENV PORT=3000
ENV NODE_ENV=production
# Ensure the database directory exists if we mount a volume there
# We'll expect the DB to be at /app/data/medtech.db if mounted, or default.

EXPOSE 3000

CMD ["npm", "start"]
