# Express Movies API

A REST API for managing movies with user authentication, built with Express.js and Sequelize ORM.

> 📖 **Architecture Documentation**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture explanation and technical documentation.

## Features

- 🔐 JWT-based authentication
- 🎬 Movie CRUD operations
- 📤 Bulk movie import from file
- 🧯 Duplicate movie protection (create + import)
- 🔎 Case-insensitive search that works with Ukrainian characters (via normalized fields)
- 🔤 Locale-aware title sorting (including Ukrainian)
- ✅ Input validation and error handling
- 🧪 Comprehensive test suite
- 🐳 Docker support

## Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express.js 5.x
- **ORM:** Sequelize 6.x
- **Database:** SQLite
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** express-validator
- **File Upload:** Multer
- **Testing:** Node.js built-in test runner

---

## Prerequisites

- Node.js 20 or higher
- npm or yarn
- Docker (optional, for containerized deployment)

---

## Local Development

### 1. Clone the repository

```bash
git clone git@github.com:starlingProj/express-movies.git
cd express-movies
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
# Required
JWT_SECRET=your-secret-key-here

# Optional (defaults shown)
APP_PORT=3000
PASSWORD_SALT_ROUNDS=10
DB_STORAGE=./app/config/dev.sqlite
DB_LOGGING=false
NODE_ENV=development
```

### 4. Start the development server

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `APP_PORT`).

### 5. Verify the installation

```bash
curl http://localhost:3000/api/v1/movies
```

### Running Tests

```bash
npm test
```

### Code Linting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

---

## Docker

### Quick Start

**For new users:** See detailed guide below.

**Quick start command:**

```bash
# Pull the image from Docker Hub:
docker pull vovashpak/express-movies:latest

# Run the container:
docker run -d \
  --name express-movies \
  -p 8000:8050 \
  -e JWT_SECRET=your-secret-key-minimum-32-characters \
  vovashpak/express-movies:latest
```

### Docker User Guide

This guide will help you run Express Movies API on a fresh computer using a Docker image.

#### Step 1: Install Docker

**For macOS:**

**Option 1: Docker Desktop (with GUI)**

1. Download from https://www.docker.com/products/docker-desktop
2. Install and start Docker Desktop
3. Verify installation:
   ```bash
   docker --version
   ```

**Option 2: Colima (lightweight, no GUI)**

```bash
# Install via Homebrew:
brew install colima docker

# Start Colima:
colima start

# Verify:
docker --version
```

**For Linux (Ubuntu/Debian):**

```bash
# Install Docker:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group:
sudo usermod -aG docker $USER

# Reload session or run:
newgrp docker

# Verify:
docker --version
```

**For Windows:**

1. Download Docker Desktop from https://www.docker.com/products/docker-desktop
2. Install and start
3. Verify in PowerShell:
   ```powershell
   docker --version
   ```

#### Step 2: Pull Docker Image

```bash
docker pull vovashpak/express-movies:latest
```

**What happens:**

- Docker downloads the ready image from Docker Hub
- All dependencies are already installed in the image
- Time: 2-5 minutes (depends on internet speed)

#### Step 3: Run the Container

**Minimal command (with required parameters):**

```bash
docker run -d \
  --name express-movies \
  -p 8000:8050 \
  -e JWT_SECRET=your-secret-key-minimum-32-characters \
  vovashpak/express-movies:latest
```

**With all options:**

```bash
docker run -d \
  --name express-movies \
  -p 8000:8050 \
  -e JWT_SECRET=your-secret-key-minimum-32-characters \
  -e APP_PORT=8050 \
  -e PASSWORD_SALT_ROUNDS=10 \
  -e DB_LOGGING=false \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped \
  vovashpak/express-movies:latest
```

**Parameter explanation:**

- `-d` - run in detached mode (background)
- `--name express-movies` - container name
- `-p 8000:8050` - port mapping (8000 on your computer → 8050 in container)
- `-e JWT_SECRET=...` - required environment variable for JWT
- `-e APP_PORT=8050` - port inside container (optional)
- `-v $(pwd)/data:/app/data` - persist database on your disk
- `--restart unless-stopped` - auto-restart on reboot

#### Step 4: Verify Everything Works

**Check container status:**

```bash
docker ps
```

You should see the `express-movies` container with status `Up`.

**Check logs:**

```bash
docker logs express-movies
```

You should see:

```
Database Connected
App is running on port 8050
```

**Test the API:**

```bash
# Create a user:
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

If everything works, you'll receive JSON with a `token`.

#### Useful Docker Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View logs
docker logs express-movies
# Or in real-time:
docker logs -f express-movies

# Stop container
docker stop express-movies

# Start stopped container
docker start express-movies

# Restart container
docker restart express-movies

# Remove container
docker stop express-movies
docker rm express-movies

# Remove image
docker rmi vovashpak/express-movies:latest
```

#### Data Persistence

By default, the database is stored inside the container. If you delete the container, data will be lost.

**To persist data on your disk:**

```bash
# Create data directory:
mkdir -p ./data

# Run with volume:
docker run -d \
  --name express-movies \
  -p 8000:8050 \
  -e JWT_SECRET=your-secret-key \
  -v $(pwd)/data:/app/data \
  your-username/express-movies:latest
```

Now the database will be stored in the `./data` folder on your computer.

#### Troubleshooting

**Problem: "Cannot connect to Docker daemon"**

- Make sure Docker Desktop is running (macOS/Windows)
- Or run `colima start` (if using Colima)

**Problem: "Port 8000 is already in use"**

- Use a different port: `-p 3000:8050` (instead of 8000)
- Or stop the other service on port 8000

**Problem: "JWT_SECRET is not configured"**

- Make sure you passed `-e JWT_SECRET=...` when running
- JWT_SECRET must be at least 32 characters

**Problem: "Container keeps restarting"**

```bash
# Check logs to understand the problem:
docker logs express-movies
```

**Problem: "denied: requested access to the resource is denied"**

- Check that the username in `docker pull` is correct
- Make sure the image is public on Docker Hub

### Port Mapping

The Docker configuration uses port mapping `8000:8050`:

- **8000** - Port on your host machine (access via `localhost:8000`)
- **8050** - Port inside the container (where the app listens)

To access the API: `http://localhost:8000/api/v1/...`

---

## API Specification

### Base URL

- **Local:** `http://localhost:3000/api/v1`
- **Docker:** `http://localhost:8000/api/v1`

### Authentication

Most endpoints require JWT authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

**Token expiration:** the JWT token currently expires in **45 minutes**.

### Password rules

- Password length: **6–64** characters
- Password cannot start or end with whitespace

### Endpoints

#### User Management

**Create User**

```http
POST /api/v1/users
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

**Response:**

```json
{
  "token": "jwt-token-here",
  "status": 1
}
```

#### Authentication

**Create Session (Login)**

```http
POST /api/v1/sessions
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "token": "jwt-token-here",
  "status": 1
}
```

Returns a JWT token for authenticated requests.

#### Movies

**List Movies**

```http
GET /api/v1/movies?limit=10&offset=0&sort=title&order=ASC&title=search&actor=actor&search=term
Authorization: Bearer <token>
```

**Query Parameters:**

- `limit` (optional): Number of items per page (1-100, default: 20)
- `offset` (optional): Number of items to skip (default: 0)
- `sort` (optional): Sort field - `id`, `title`, or `year` (default: `title`)
- `order` (optional): Sort order - `ASC` or `DESC` (default: `ASC`)
- `title` (optional): Filter by movie title
- `actor` (optional): Filter by actor name
- `search` (optional): Search in both title and actor names

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Movie Title",
      "year": 1999,
      "format": "DVD",
      "actors": [
        {
          "id": 1,
          "name": "Actor Name"
        }
      ]
    }
  ],
  "meta": {
    "total": 100,
    "pageSize": 20
  },
  "status": 1
}
```

**Get Movie**

```http
GET /api/v1/movies/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "data": {
    "id": 1,
    "title": "Movie Title",
    "year": 1999,
    "format": "DVD",
    "actors": [
      {
        "id": 1,
        "name": "Actor Name"
      }
    ]
  },
  "status": 1
}
```

**Create Movie**

```http
POST /api/v1/movies
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "year": number,
  "format": "VHS" | "DVD" | "Blu-Ray" | "Digital",
  "actors": ["string"]
}
```

**Response:**

```json
{
  "data": {
    "id": 1,
    "title": "Movie Title",
    "year": 1999,
    "format": "DVD",
    "actors": [
      ...
    ]
  },
  "status": 1
}
```

**Update Movie**

```http
PATCH /api/v1/movies/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "year": number,
  "format": "VHS" | "DVD" | "Blu-Ray" | "Digital",
  "actors": ["string"]
}
```

All fields are optional. Only provided fields will be updated.

**Delete Movie**

```http
DELETE /api/v1/movies/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "status": 1
}
```

**Import Movies**

```http
POST /api/v1/movies/import
Authorization: Bearer <token>
Content-Type: multipart/form-data

movies: <file>
```

The import file should be a text file with movies in the following format:

```
Title: Movie Title
Release Year: 1999
Format: DVD
Stars: Actor1, Actor2, Actor3

Title: Another Movie
Release Year: 2000
Format: Blu-Ray
Stars: Actor4, Actor5
```

**Response:**

```json
{
  "data": [
    ...
  ],
  "meta": {
    "imported": 8,
    "duplicates": 2,
    "total": 10
  },
  "status": 1
}
```

### Error Responses

All errors follow this format:

```json
{
  "error": "errorCode",
  "message": "Human-readable error message",
  "paramMap": {
    "additional": "error details"
  }
}
```

**Common Error Codes:**

- `invalidInputData` - Validation failed (400)
- `passwordLeadingOrTrailingWhitespace` - Password cannot start/end with whitespace (400)
- `unauthorized` - Not authenticated (401)
- `invalidToken` - Invalid or expired token (401)
- `tokenMissing` - No token provided (401)
- `notFound` - Resource not found (404)
- `movieDoesNotExist` - Movie not found (404)
- `movieAlreadyExists` - Duplicate movie (same title/year/format + actors set) (409)
- `emailAlreadyExists` - Email already registered (409)
- `invalidCredentials` - Wrong email/password (401)

---

## Project Structure

```
express-movies/
├── app/
│   ├── abl/              # Application Business Logic
│   │   ├── movie/        # Movie business logic
│   │   ├── session/      # Session/auth logic
│   │   └── user/         # User business logic
│   ├── api/
│   │   ├── controllers/  # Request handlers
│   │   ├── errors/       # Custom error classes
│   │   ├── routes/       # API route definitions
│   │   └── validation-schemas/  # Input validation
│   ├── components/
│   │   ├── dto/          # Data Transfer Objects
│   │   ├── helpers/      # Utility functions
│   │   └── services/     # Business services (JWT, password hashing)
│   ├── config/           # Configuration files
│   ├── constants/        # Application constants
│   ├── dao/              # Data Access Objects
│   ├── middleware/       # Express middleware
│   └── models/           # Sequelize models
├── test/                 # Test files        
├── Dockerfile            # Docker configuration
├── index.js              # Application entry point
└── package.json          # Dependencies and scripts
```

---

## Environment Variables

| Variable               | Required | Default                   | Description                             |
|------------------------|----------|---------------------------|-----------------------------------------|
| `JWT_SECRET`           | Yes      | -                         | Secret key for JWT token signing        |
| `APP_PORT`             | No       | `3000`                    | Port for the application server         |
| `PASSWORD_SALT_ROUNDS` | No       | `10`                      | Bcrypt salt rounds for password hashing |
| `DB_STORAGE`           | No       | `./app/config/dev.sqlite` | SQLite database file path               |
| `DB_LOGGING`           | No       | `false`                   | Enable SQL query logging                |
| `NODE_ENV`             | No       | `development`             | Environment mode                        |

---

## Database

The application uses SQLite for data storage. The database file is created automatically on first run.

- **Local development:** `./app/config/dev.sqlite`
- **Docker:** `/app/data/dev.sqlite`
- **Tests:** In-memory database (`:memory:`)

---

## Scripts

| Command            | Description                                  |
|--------------------|----------------------------------------------|
| `npm start`        | Start the production server                  |
| `npm run dev`      | Start the development server with watch mode |
| `npm test`         | Run the test suite                           |
| `npm run lint`     | Check code for linting errors                |
| `npm run lint:fix` | Auto-fix linting errors                      |

---

## Troubleshooting

### Port Already in Use

If the port is already in use:

- Change `APP_PORT` in `.env` file
- Or use a different port mapping in Docker: `-p <host-port>:8050`

## License

ISC

## Author

Volodymyr Shpak
