FROM node:22-bookworm

WORKDIR /app

# Install Python
RUN apt-get update \
    && apt-get install -y python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Node dependencies
COPY package*.json ./
RUN npm ci

# Install Python dependencies
COPY requirements.txt ./
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Copy backend source code
COPY . .

# Render provides the PORT environment variable
EXPOSE 5000

# Start the Express backend
CMD ["npm", "start"]