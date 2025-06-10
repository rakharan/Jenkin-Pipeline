# =================================================================
# STAGE 1: The "Builder" Stage
# This stage installs all dependencies (including dev) and builds our code.
# =================================================================
FROM node:20-slim AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker's layer caching.
# This step only re-runs if these files change.
COPY package*.json ./

# Install all dependencies, including devDependencies needed for the build
RUN npm ci

# Copy the rest of our application source code
COPY . .

# Run the build script from package.json (tsc) to compile TypeScript to JavaScript
RUN npm run build


# =================================================================
# STAGE 2: The "Final" Production Stage
# This stage builds the final image, copying only what's needed from the builder.
# =================================================================
FROM node:20-slim

WORKDIR /app

# Copy only the necessary files from the 'builder' stage
# This leaves behind all the source code and devDependencies, making the image small and secure.
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Install ONLY the production dependencies
RUN npm ci --omit=dev

# Tell Docker that the container listens on port 3000 at runtime
EXPOSE 3000

# The command to run when the container starts
CMD [ "node", "dist/main.js" ]