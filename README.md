# Customer Management Application

A full-stack customer management application with Spring Boot backend, React frontend, and MySQL database.

## 🏗️ Architecture

- **Backend**: Spring Boot 3.5.5 with JPA/Hibernate (Port 8080)
- **Frontend**: React with TypeScript and Vite (Port 3000)
- **Database**: MySQL 8.0 (Port 3306)
- **Containerization**: Docker & Docker Compose

## 🚀 Quick Start

### Prerequisites
- Docker
- Docker Compose (v2)

### Docker Permissions Setup (Linux)
If you get permission denied errors, add your user to the docker group:
```bash
sudo usermod -aG docker $USER
sudo service docker restart
# Then logout and login again, or run:
newgrp docker
```

Alternatively, run Docker commands with sudo:
```bash
sudo ./start.sh
```

### Option 1: Use the start script (Recommended)
```bash
./start.sh
```

### Option 2: Manual Docker Compose
```bash
# Build and start all services
docker compose up --build -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## 📱 Access the Application

After starting the services:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Database**: localhost:3306 (username: root, password: root)

## 🛠️ Development

### Backend Development
```bash
# Run Spring Boot locally (requires MySQL running)
cd /path/to/project
mvn spring-boot:run
```

### Frontend Development
```bash
# Run React development server
cd frontend
npm install
npm run dev
```

## 📊 API Endpoints

- `GET /api/customers` - Get all customers
- `GET /api/customers/{id}` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

## 🗃️ Database Schema

### Customer Table
```sql
CREATE TABLE customer (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone_no VARCHAR(20),
    email VARCHAR(255)
);
```

## 🐳 Docker Services

### Backend Service (app)
- Built from root Dockerfile
- Exposes port 8080
- Connects to MySQL database
- Auto-restart on failure

### Frontend Service (frontend)
- Built from frontend/Dockerfile
- Nginx production build
- Exposes port 3000
- Proxies API calls to backend

### Database Service (db)
- MySQL 8.0 official image
- Persistent data storage
- Exposes port 3306

## 🔧 Configuration

### Environment Variables

#### Backend (application.properties)
```properties
spring.datasource.url=jdbc:mysql://db:3306/shop
spring.datasource.username=root
spring.datasource.password=root
spring.jpa.hibernate.ddl-auto=update
```

#### Frontend (Vite)
```env
VITE_API_URL=http://localhost:8080
```

## 📝 Management Commands

### Start Application
```bash
./start.sh
```

### Stop Application
```bash
./stop.sh
```

### View Logs
```bash
docker compose logs -f [service-name]
```

### Rebuild Services
```bash
docker compose up --build
```

### Clean Up
```bash
# Remove containers and networks
docker compose down

# Remove containers, networks, and volumes (⚠️ deletes database data)
docker compose down -v

# Clean up unused Docker images
docker system prune
```

## 🐛 Troubleshooting

### Port Conflicts
If ports are already in use, modify the port mappings in `docker-compose.yml`:
```yaml
ports:
  - "8081:8080"  # Backend
  - "3001:3000"  # Frontend
  - "3307:3306"  # Database
```

### Database Connection Issues
1. Ensure MySQL container is running: `docker-compose ps`
2. Check database logs: `docker-compose logs db`
3. Verify connection string in application.properties

### Frontend API Issues
1. Check if backend is running: `curl http://localhost:8080/api/customers`
2. Verify CORS configuration in CustomerController
3. Check network connectivity between containers

## 📁 Project Structure

```
A3/
├── src/main/java/com/example/A3/     # Spring Boot backend
├── frontend/                         # React frontend
├── docker-compose.yml               # Docker Compose configuration
├── Dockerfile                       # Backend Docker image
├── start.sh                        # Application start script
├── stop.sh                         # Application stop script
└── README.md                       # This file
```

## 🎯 Features

- Full CRUD operations for customer management
- Responsive React frontend with Ant Design
- RESTful API with Spring Boot
- Docker containerization for easy deployment
- Persistent MySQL database
- Production-ready Nginx frontend serving
- Auto-restart and health checks

## 👥 Team

IBPP Assignment-3 Div.F : Group 1
