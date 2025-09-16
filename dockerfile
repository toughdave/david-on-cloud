# Use a lightweight web server
FROM nginx:alpine

# Copy website files into the Nginx HTML folder
COPY . /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Nginx runs automatically
