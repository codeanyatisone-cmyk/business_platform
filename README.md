# Business Platform

A modern full-stack business management platform with JWT authentication, built with React, FastAPI, and PostgreSQL.

## Features

- 🔐 JWT Authentication with secure token management
- 🏢 Multi-tenant company management
- 👥 Employee management with departments
- 📋 Task management with Kanban boards
- 💰 Financial tracking and reporting
- 📚 Knowledge base with articles and quizzes
- 🎓 Academy with courses and lessons
- 📰 Corporate news and announcements
- 🔧 Admin panel for system management

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Axios for API communication
- Context API for state management

### Backend
- FastAPI with Python 3.11
- SQLAlchemy ORM with PostgreSQL
- JWT authentication with PyJWT
- Alembic for database migrations
- Pydantic for data validation

### Infrastructure
- Docker & Docker Compose
- Nginx reverse proxy
- PostgreSQL database
- SSL/TLS encryption

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd business-platform
```

2. Start the development environment:
```bash
docker compose up -d
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api/docs

### Environment Configuration

Create environment files for configuration:

**Backend (.env):**
```env
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=120
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/business_platform
DATABASE_URL_ASYNC=postgresql+asyncpg://postgres:postgres@postgres:5432/business_platform
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/profile` - Get user profile (requires JWT)

### Health Check
- `GET /health` - Service health status

## Deployment

The application is configured for deployment with:
- GitHub Actions CI/CD pipeline
- Docker containerization
- SSL certificate management
- Domain configuration

See the deployment documentation for server setup instructions.

## Development

### Backend Development
```bash
cd fastapi-backend
pip install -e .
uvicorn app.main:app --reload --host 0.0.0.0 --port 3001
```

### Frontend Development
```bash
cd business-platform
npm install
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.# Deployment Test - Tue Oct 21 14:50:54 +05 2025
