# 🛠️ Business Platform - Developer Documentation

## 🏗️ System Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python 3.11
- **Database**: PostgreSQL 15
- **Email**: Mailcow integration (IMAP/SMTP)
- **Deployment**: Docker + Nginx
- **Authentication**: JWT tokens

### Project Structure
```
business-platform/
├── src/                    # React frontend
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts (Auth, App)
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   └── types/             # TypeScript definitions
├── fastapi-backend/       # Python backend
│   ├── app/
│   │   ├── api/v1/       # API endpoints
│   │   ├── core/         # Core configuration
│   │   ├── models/       # SQLAlchemy models
│   │   └── schemas/      # Pydantic schemas
│   └── alembic/          # Database migrations
└── ER_DIAGRAM_MERMAID.md # Database schema
```

---

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15
- Docker & Docker Compose
- Git

### Backend Setup
```bash
cd fastapi-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example .env
# Edit .env with your database and Mailcow settings
alembic upgrade head
python run.py
```

### Frontend Setup
```bash
cd business-platform
npm install
npm start
```

### Environment Variables
```bash
# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/business_platform
MAILCOW_API_KEY=your-mailcow-api-key
MAILCOW_DOMAIN=v4.business
MAILCOW_API_URL=https://mail.v4.business/api/v1
SECRET_KEY=your-secret-key
```

---

## 🗄️ Database Schema

### Core Entities
- **Company**: Multi-tenant organization
- **User**: Authentication system (1:1 with Employee)
- **Employee**: Main working entity
- **Department**: Hierarchical department structure

### Task Management
- **Task**: Tasks with statuses, priorities, dependencies
- **Sprint**: Development iterations
- **Epic**: Large functionalities
- **TaskComment**: Task discussions
- **TimeLog**: Time tracking

### Financial System
- **Account**: Company financial accounts
- **Transaction**: Income, expenses, transfers

### Content & Learning
- **NewsItem**: Corporate news
- **Course**: Training programs
- **Lesson**: Individual lessons

### Relationships
- Many-to-many: TaskWatchers, TaskDependencies
- One-to-many: Company → Employees, Department → Employees
- One-to-one: User ↔ Employee

---

## 🔌 API Endpoints

### Authentication
```http
POST /api/v1/auth/login
POST /api/v1/auth/register
GET  /api/v1/auth/profile
```

### Employee Management
```http
GET    /api/v1/employees
POST   /api/v1/employees
GET    /api/v1/employees/{id}
PUT    /api/v1/employees/{id}
DELETE /api/v1/employees/{id}
```

### Task Management
```http
GET    /api/v1/tasks
POST   /api/v1/tasks
GET    /api/v1/tasks/{id}
PUT    /api/v1/tasks/{id}
DELETE /api/v1/tasks/{id}
```

### Mailbox Integration
```http
GET  /api/v1/mailbox/info
POST /api/v1/mailbox/create
POST /api/v1/mailbox/set-password
POST /api/v1/mailbox/update-password
GET  /api/v1/mailbox/emails
POST /api/v1/mailbox/emails/send
```

### Financial Management
```http
GET    /api/v1/finances/transactions
POST   /api/v1/finances/transactions
GET    /api/v1/finances/accounts
POST   /api/v1/finances/accounts
```

---

## 📧 Email Integration

### Mailcow API Integration
The platform integrates with Mailcow for email management:

```python
# Creating mailbox
async def create_mailcow_mailbox(email: str, password: str, name: str):
    mailbox_data = {
        "active": "1",
        "local_part": email.split('@')[0],
        "domain": MAILCOW_DOMAIN,
        "name": name,
        "password": password,
        "quota": "1024"
    }
    # API call to Mailcow
```

### IMAP/SMTP Client
Built-in email client using Python's `imaplib` and `smtplib`:

```python
class EmailService:
    def __init__(self, email: str, password: str):
        self.email = email
        self.password = password
    
    def get_emails(self, folder: str = "INBOX"):
        # IMAP connection and email retrieval
```

### Email Features
- **Read emails**: IMAP integration
- **Send emails**: SMTP integration
- **Folder management**: Create, delete, move folders
- **Search**: Full-text search in emails
- **Attachments**: Handle email attachments

---

## 🔐 Authentication & Security

### JWT Token System
```python
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt
```

### Password Hashing
Using bcrypt for secure password storage:

```python
def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
```

### Role-Based Access Control
- **Admin**: Full system access
- **Manager**: Team management, reports
- **Employee**: Basic feature access

---

## 🎨 Frontend Architecture

### Component Structure
```
src/components/
├── ui/              # Base UI components (Button, Input, Modal)
├── layout/          # Layout components (Sidebar, Header)
├── forms/           # Form components
├── tasks/           # Task-related components
├── passwords/       # Password management components
└── boards/          # Board components
```

### State Management
- **React Context**: Global state (AuthContext, AppContext)
- **Local State**: Component-level state with useState
- **Custom Hooks**: Reusable logic (useAPI, useNotification)

### API Integration
```typescript
// API service example
export const api = {
  employees: {
    getAll: () => axios.get('/api/v1/employees'),
    create: (data: EmployeeCreate) => axios.post('/api/v1/employees', data),
    update: (id: number, data: EmployeeUpdate) => axios.put(`/api/v1/employees/${id}`, data),
    delete: (id: number) => axios.delete(`/api/v1/employees/${id}`)
  }
}
```

---

## 🐳 Deployment

### Docker Configuration
```yaml
# docker-compose.yml
version: '3.8'
services:
  bp-postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: business_platform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secure_password_change_me
    volumes:
      - postgres_data:/var/lib/postgresql/data

  bp-backend:
    build: ./fastapi-backend
    ports:
      - "8001:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:secure_password_change_me@bp-postgres:5432/business_platform
    depends_on:
      - bp-postgres

  bp-frontend:
    build: ./business-platform
    ports:
      - "3001:80"
    depends_on:
      - bp-backend
```

### Production Deployment
```bash
# Deploy script
./deploy-fullstack-from-github.sh
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name v4.business;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🧪 Testing

### Backend Testing
```python
# Test example
def test_create_employee():
    response = client.post("/api/v1/employees", json=employee_data)
    assert response.status_code == 200
    assert response.json()["email"] == employee_data["email"]
```

### Frontend Testing
```typescript
// Component test example
import { render, screen } from '@testing-library/react';
import { EmployeePage } from './EmployeePage';

test('renders employee list', () => {
  render(<EmployeePage />);
  expect(screen.getByText('Сотрудники')).toBeInTheDocument();
});
```

### API Testing
```bash
# Test mailbox API
python test_mailbox.py
```

---

## 🔧 Development Tools

### Code Quality
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Black**: Python code formatting
- **MyPy**: Python type checking

### Database Management
- **Alembic**: Database migrations
- **SQLAlchemy**: ORM
- **pgAdmin**: Database administration

### Development Scripts
```bash
# Backend
python run.py              # Start development server
alembic upgrade head       # Run migrations
python test_mailbox.py     # Test mailbox API

# Frontend
npm start                  # Start development server
npm run build             # Build for production
npm test                  # Run tests
```

---

## 🐛 Debugging

### Common Issues

**Database Connection Issues**
```python
# Check database connection
from sqlalchemy import create_engine
engine = create_engine(DATABASE_URL)
connection = engine.connect()
```

**Email Integration Problems**
```python
# Test Mailcow API
import httpx
async with httpx.AsyncClient() as client:
    response = await client.get(f"{MAILCOW_API_URL}/get/mailbox/{domain}/{user}")
```

**Frontend API Errors**
```typescript
// Check API configuration
console.log(process.env.REACT_APP_API_URL);
```

### Logging
```python
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
```

---

## 📈 Performance Optimization

### Backend Optimization
- **Database Indexing**: Add indexes for frequently queried fields
- **Connection Pooling**: Use connection pools for database
- **Caching**: Implement Redis caching for frequently accessed data
- **Async Operations**: Use async/await for I/O operations

### Frontend Optimization
- **Code Splitting**: Lazy load components
- **Memoization**: Use React.memo and useMemo
- **Bundle Analysis**: Analyze bundle size
- **Image Optimization**: Compress and optimize images

---

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.11
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: pytest
```

### Deployment Automation
- **Automated Testing**: Run tests on every commit
- **Code Quality Checks**: Linting and formatting
- **Security Scanning**: Dependency vulnerability checks
- **Automated Deployment**: Deploy to staging/production

---

## 📚 Additional Resources

### Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

### Useful Commands
```bash
# Database
alembic revision --autogenerate -m "Description"
alembic upgrade head
alembic downgrade -1

# Docker
docker-compose up -d --build
docker-compose down
docker logs bp-backend

# Git
git add .
git commit -m "Description"
git push origin main
```

---

## 🤝 Contributing

### Code Standards
- Follow PEP 8 for Python code
- Use TypeScript for all frontend code
- Write comprehensive tests
- Document all public APIs
- Use meaningful commit messages

### Pull Request Process
1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Code review and merge

---

*Last updated: January 2025*
*Platform version: 2.0*

