# Production Dockerfile for SmartFlow Portfolio
FROM python:3.11-slim

WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN pip install --no-cache-dir flask pillow

# Copy application files
COPY . .

# Ensure executable permissions
RUN chmod +x run.sh

# Expose the port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the server
CMD ["python3", "main.py"]