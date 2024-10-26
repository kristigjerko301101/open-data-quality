# Dockerfile for Python scripts
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy wait-for-it.sh script and make it executable
COPY wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod +x /usr/local/bin/wait-for-it

# Copy Python scripts
COPY . .

# Default command to run wait-for-it and then the Python script
CMD ["wait-for-it", "db:5432", "--", "python", "p08_main.py"]
