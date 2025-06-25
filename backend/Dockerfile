# Use Bun's official base image
FROM oven/bun:1.1

# Set working directory
WORKDIR /app

# Copy dependency files first
COPY . .

# Install dependencies
RUN bun install

# Copy the rest of the project
COPY . .

# Expose your port (change if not 3000)
EXPOSE 3000

# Start your app
CMD ["bun", "run", "src/index.ts"]