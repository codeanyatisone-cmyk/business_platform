# Business Platform Backend

A FastAPI-based backend service for the Business Platform application.

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

- FastAPI with Python 3.11
- SQLAlchemy ORM with PostgreSQL
- JWT authentication with PyJWT
- Alembic for database migrations
- Pydantic for data validation
- Docker containerization

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL
- Docker (optional)

### Local Development

1. Clone the repository:
```bash
git clone git@github.com:codeanyatisone-cmyk/business_platform_backend.git
cd business_platform_backend
```

2. Install dependencies:
```bash
pip install -e .
```

3. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your configuration
```

4. Run database migrations:
```bash
alembic upgrade head
```

5. Start the development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 3001
```

### Docker Development

1. Build and run with Docker Compose:
```bash
docker-compose up -d
```

2. Access the API:
- API: http://localhost:3001
- API Documentation: http://localhost:3001/api/docs

## Environment Configuration

Create a `.env` file with the following variables:

```env
ENVIRONMENT=development
DEBUG=True
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=120
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/business_platform
DATABASE_URL_ASYNC=postgresql+asyncpg://postgres:postgres@localhost:5432/business_platform
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/profile` - Get user profile (requires JWT)

### Health Check
- `GET /health` - Service health status

## Deployment

The backend is configured for deployment with:
- Docker containerization
- Server SSH deployment scripts
- SSL certificate management
- Database migrations

### Server Deployment

1. Configure your server connection in `config/server.conf`
2. Run deployment script:
```bash
./deploy.sh
```

## Development

### Database Migrations

Create a new migration:
```bash
alembic revision --autogenerate -m "Description of changes"
```

Apply migrations:
```bash
alembic upgrade head
```

### Testing

Run tests:
```bash
pytest
```

## Frontend Integration

This backend is designed to work with the Business Platform frontend:
- **Frontend Repository**: https://github.com/codeanyatisone-cmyk/business_platform
- **API Base URL**: Configure frontend to point to this backend API

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.