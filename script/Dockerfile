# Dockerfile for Python scripts
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install Python dependencies (update with your requirements)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Python scripts
COPY . .

# Command to run your Python script (replace script.py with your script name)
CMD ["python", "p08_main.py"]
