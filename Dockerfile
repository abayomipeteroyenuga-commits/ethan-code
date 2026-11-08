FROM nginx:1.27-alpine

# Railway injects PORT at runtime. The nginx template is rendered by the
# official nginx container entrypoint before nginx starts.
RUN apk add --no-cache gettext
ENV PORT=8080

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY index.html /usr/share/nginx/html/index.html
COPY assets/ /usr/share/nginx/html/assets/
COPY icons/ /usr/share/nginx/html/icons/
COPY manifest.webmanifest /usr/share/nginx/html/manifest.webmanifest
COPY sw.js /usr/share/nginx/html/sw.js

EXPOSE 8080
