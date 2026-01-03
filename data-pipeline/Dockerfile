FROM python:3.11-slim

USER root
COPY requirements.txt /tmp/
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt

WORKDIR /app
COPY . /app

# Keep container running until a pipeline script is added
CMD ["sleep", "infinity"]