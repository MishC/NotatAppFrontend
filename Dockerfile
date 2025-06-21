# Build step
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

# Production nginx server
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
