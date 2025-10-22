# Business Platform Frontend

A modern React-based frontend application for the Business Platform.

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

- React 18 with TypeScript
- Tailwind CSS for styling
- Axios for API communication
- Context API for state management
- Docker containerization

## Backend Repository

The backend API is now in a separate repository:
- **Backend Repository**: [business_platform_backend](https://github.com/codeanyatisone-cmyk/business_platform_backend)
- **API Documentation**: Available at the backend repository

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker (optional)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/codeanyatisone-cmyk/business_platform.git
cd business_platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm start
```

5. Access the application:
- Frontend: http://localhost:3000

### Docker Development

1. Build and run with Docker:
```bash
docker build -t business-platform-frontend .
docker run -p 3000:80 business-platform-frontend
```

2. Access the application:
- Frontend: http://localhost:3000

## Environment Configuration

Create a `.env` file with the following variables:

```env
REACT_APP_API_URL=https://api.yourdomain.com/api/v1
REACT_APP_ENVIRONMENT=development
```

## Deployment

The frontend is configured for deployment with:
- Docker containerization
- Server SSH deployment scripts
- SSL certificate management
- Nginx reverse proxy

### Server Deployment

1. Configure your server connection in `config/server.conf`
2. Run deployment script:
```bash
./deploy.sh
```

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Building for Production

```bash
npm run build
```

This builds the app for production to the `build` folder.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.# Deployment Test - Tue Oct 21 14:50:54 +05 2025
