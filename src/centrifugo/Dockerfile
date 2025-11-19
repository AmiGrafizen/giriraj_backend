# Centrifugo official image
FROM centrifugo/centrifugo:v6

# Copy your config into the container
COPY config.json /centrifugo/config.json

# Expose default port
EXPOSE 8000

# Run Centrifugo with your config file
CMD ["centrifugo", "-c", "/centrifugo/config.json"]
