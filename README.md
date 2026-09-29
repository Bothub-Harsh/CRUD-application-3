# EduAdmin - Student Management System

A professional, full-stack student management application built with **MongoDB**, **Express**, **React (Vite)**, and **Node.js**.

This project provides an administrator with complete tools to manage records smoothly, including full CRUD operations, real-time search, customized filtering, pagination, and a dynamic dashboard tailored using an elegant, modern UI.

## Features

- **Admin Authentication**: Secure JWT & bcrypt based authentication for administrators.
- **Dynamic Dashboard**: View visual analytics showing total, active, inactive students, along with chart representation for departments and courses.
- **Complete CRUD**: Create, Read, Update, and Delete student profiles easily.
- **Robust Verification & Validation**: Strict database schema with Mongoose validations preventing duplicates (emails/student IDs).
- **Search & Filters**: Comprehensive search and multi-faceted filtering (course, department, gender, status, year).
- **Pagination & Sorting**: Handle massive databases natively through backend-level pagination, paired with multi-parameter list sorting.
- **Modern UI Patterns**: Crafted manually using vanilla CSS targeting glassmorphism, fluid interactive animations, responsiveness (mobile/tablet/desktop ready), and a beautiful dark mode default style.

## Tech Stack

### Frontend
- **Framework**: React 18
- **Tooling**: Vite
- **Routing**: React Router Dom v6
- **Styling**: Vanilla CSS (Global Design System)
- **Icons**: Lucide React
- **Notifications**: React Toastify

### Backend
- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Real database)
- **ODM**: Mongoose
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Security Middleware**: Helmet, CORS config

---

## Project Structure

```
student-management-system/
│
├── client/                     # React Frontend App
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Application views
│   │   ├── services/           # Axios API services
│   │   ├── hooks/              # Custom React hooks (useAuth)
│   │   ├── index.css           # Complete Global Design System
│   │   ├── main.jsx            # Entry point
│   │   └── App.jsx             # Router and Auth Wrapper
│   ├── build/                  # Production compilation
│   └── vite.config.js          # Vite config with API proxy
│
├── server/                     # Node.js/Express Backend App
│   ├── config/                 # DB connections and configurations
│   ├── controllers/            # Core business logic processing
│   ├── middleware/             # Route protection & Error handlers
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Defined API endpoints
│   ├── index.js                # Server entry point
│   └── .env                    # Environment configurations
│
└── README.md
```

## Running the Project Locally

### 1. Database Configuration (MongoDB)

You must have a REAL MongoDB database running or provide an Atlas connection string.

**Local MongoDB Installation:**
- Download & install [MongoDB Community Server](https://www.mongodb.com/try/download/community).
- Wait for it to install `mongod` as a service.
- The standard local connection URI is: `mongodb://localhost:27017/student_management`.

**MongoDB Atlas Setup (Cloud):**
- Create a Free Cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- Go to **Database Access** and add a new user and password.
- Go to **Network Access** and Allow Access From Anywhere `0.0.0.0/0`.
- Click Connect, select **Connect your application**, and copy the connection string.

### 2. Environment Variables

Navigate to the `server/` folder. The system will look for the `.env` file. We have provided a `.env.example` file in the root for structural understanding. Ensure `server/.env` contains your specific configuration:
```env
MONGODB_URI=mongodb://localhost:27017/student_management
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
*(Replace `MONGODB_URI` with your Atlas URL if you are using the cloud database)*.

### 3. Start Backend

Open your terminal and navigate to the project directory:
```bash
cd "server"
npm install
npm run dev
```
Wait for the terminal to output:
`✅ MongoDB connected successfully`
`🚀 Server running on port 5000`

### 4. Start Frontend

Open a new terminal window:
```bash
cd "client"
npm install
npm run dev
```
The client app should start at **[http://localhost:5173](http://localhost:5173)**. Open this link in your browser.

---

## API Documentation

### Auth APIs
- `POST /api/auth/register` - Create an admin
- `POST /api/auth/login` - Administrator login
- `GET /api/auth/me` - Validates session and gets admin info

### Student APIs (Protected by JWT)
- `GET /api/students` - Returns paginated students.
    - Query parameters supported: `search`, `department`, `course`, `year`, `gender`, `status`, `sortBy`, `sortOrder`, `page`, `limit`
- `GET /api/students/:id` - Fetch student by unique MongoDB Object_id.
- `GET /api/students/stats` - Pull aggregated analytic stats for the Admin dashboard.
- `POST /api/students` - Create a student record.
- `PUT /api/students/:id` - Update existing student records.
- `DELETE /api/students/:id` - Remove a student from the cluster.

---

## Deployment on AWS EC2 (Ubuntu)

This application is structurally prepared for VPS deployment (AWS EC2, DigitalOcean, etc.) utilizing Node.js, PM2, and Nginx.

### 1. Server Preparation
```bash
sudo apt update && sudo apt upgrade -y
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-install -y nodejs nginx
# Install PM2 globally
sudo npm install -g pm2
```

### 2. Prepare the Code
Clone this project onto the server.

### 3. Frontend Build Setup
```bash
cd client
npm install
npm run build
```
This will create a `dist/` directory that Nginx will serve statically.

### 4. Backend (PM2) Setup
```bash
cd ../server
npm install
```
Configure your `.env` within `/server` for production (using your remote MongoDB Atlas connection string!).
Start the API service via PM2:
```bash
pm2 start index.js --name "eduadmin-api"
pm2 save
pm2 startup
```

### 5. Nginx Configuration
Create an Nginx configuration file (`/etc/nginx/sites-available/eduadmin`):
```nginx
server {
    listen 80;
    server_name your_domain_or_ip;

    # Serve the React Frontend Build
    location / {
        root /path/to/student-management-system/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API Requests to backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable the configuration and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/eduadmin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Troubleshooting Database Errors

1. **`connect ECONNREFUSED` / Database Error Upon Backend Boot:**
    - Verify your local `mongod` is actually running as a background service. (Windows Run -> `services.msc` -> MongoDB -> Start).
    - If using Atlas, confirm your current IP is whitelisted inside the **Network Access** tab.

2. **CORS Errors preventing frontend requests:**
    - Assure `CLIENT_URL` correctly mirrors your accurate frontend deployment URL without an appending slash (e.g., `http://localhost:5173`).
