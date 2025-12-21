# Express Movies API

A REST API for managing movies with user authentication, built with Express.js and Sequelize ORM.

## Features

- 🔐 JWT-based authentication
- 🎬 Movie CRUD operations
- 📤 Bulk movie import from file
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

## Prerequisites

- Node.js 20 or higher
- npm or yarn
- Docker (optional, for containerized deployment)

## Getting Started

### Local Development

#### 1. Clone the repository

```bash
git clone <repository-url>
cd express-sequelize
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Configure environment variables

Create a `.env` file in the root directory:

Edit `.env` and set the following variables:

```env
# Required
JWT_SECRET=your-secret-key-here

# Optional (defaults shown)
APP_PORT=3000
PASSWORD_SALT_ROUNDS=10
DB_LOGGING=false
```

#### 4. Start the development server

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `APP_PORT`).

#### 5. Verify the installation

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

## Docker Deployment

### Build the Docker image

```bash
docker build -t express-movies .
```

### Run the container

**Minimal command:**

```bash
docker run -d \
  --name movies \
  -p 8000:8050 \
  -e APP_PORT=8050 \
  -e JWT_SECRET=your-secret-key-here \
  express-movies
```

**With .env file:**

```bash
docker run -d \
  --name movies \
  -p 8000:8050 \
  -e APP_PORT=8050 \
  --env-file .env \
  express-movies
```

**Full example with all options:**

```bash
docker run -d \
  --name movies \
  -p 8000:8050 \
  -e APP_PORT=8050 \
  -e JWT_SECRET=$(openssl rand -base64 32) \
  -e DB_STORAGE=/app/data/dev.sqlite \
  -e NODE_ENV=production \
  --restart unless-stopped \
  express-movies
```

### Container Management

```bash
# View logs
docker logs -f movies

# Stop container
docker stop movies

# Start container
docker start movies

# Remove container
docker rm movies

# Stop and remove
docker stop movies && docker rm movies
```

### Port Mapping

The Docker configuration uses port mapping `8000:8050`:

- **8000** - Port on your host machine (access via `localhost:8000`)
- **8050** - Port inside the container (where the app listens)

To access the API: `http://localhost:8000/api/v1/...`

## API Documentation

### Base URL

- **Local:** `http://localhost:3000/api/v1`
- **Docker:** `http://localhost:8000/api/v1`

### Authentication

Most endpoints require JWT authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### User Management

**Create User**

```http
POST /api/v1/users
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "passwordConfirmation": "string"
}
```

#### Authentication

**Create Session (Login)**

```http
POST /api/v1/sessions
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

Returns a JWT token for authenticated requests.

#### Movies

**List Movies**

```http
GET /api/v1/movies?page=1&limit=10
Authorization: Bearer <token>
```

**Get Movie**

```http
GET /api/v1/movies/:id
Authorization: Bearer <token>
```

**Create Movie**

```http
POST /api/v1/movies
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "releaseYear": number,
  "format": "VHS" | "DVD" | "Blu-Ray",
  "stars": ["string"]
}
```

**Update Movie**

```http
PATCH /api/v1/movies/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "releaseYear": number,
  "format": "VHS" | "DVD" | "Blu-Ray",
  "stars": ["string"]
}
```

**Delete Movie**

```http
DELETE /api/v1/movies/:id
Authorization: Bearer <token>
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
Title: Release Year: Format: Stars
Movie Title: 1999: DVD: Actor1, Actor2, Actor3
```

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

## Environment Variables

| Variable               | Required | Default                   | Description                             |
|------------------------|----------|---------------------------|-----------------------------------------|
| `JWT_SECRET`           | Yes      | -                         | Secret key for JWT token signing        |
| `APP_PORT`             | No       | `3000`                    | Port for the application server         |
| `PASSWORD_SALT_ROUNDS` | No       | `10`                      | Bcrypt salt rounds for password hashing |
| `DB_STORAGE`           | No       | `./app/config/dev.sqlite` | SQLite database file path               |
| `DB_LOGGING`           | No       | `false`                   | Enable SQL query logging                |
| `NODE_ENV`             | No       | `development`             | Environment mode                        |

## Database

The application uses SQLite for data storage. The database file is created automatically on first run.

- **Local development:** `./app/config/dev.sqlite`
- **Docker:** `/app/data/dev.sqlite`
- **Tests:** In-memory database (`:memory:`)

## Scripts

| Command            | Description                                  |
|--------------------|----------------------------------------------|
| `npm start`        | Start the production server                  |
| `npm run dev`      | Start the development server with watch mode |
| `npm test`         | Run the test suite                           |
| `npm run lint`     | Check code for linting errors                |
| `npm run lint:fix` | Auto-fix linting errors                      |

## Troubleshooting

### Port Already in Use

If the port is already in use:

- Change `APP_PORT` in `.env` file
- Or use a different port mapping in Docker: `-p <host-port>:8050`

