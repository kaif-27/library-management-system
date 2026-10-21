# 📚 Library Management System

A full-stack web application for managing college library operations built with React, Node.js, and MySQL.

## 🚀 Live Demo
Coming soon...

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js + Express |
| Database | MySQL |
| Authentication | JWT + BCrypt |

## ✨ Features

### 👨‍💼 Admin
- Add, edit, delete books
- Issue and return books
- View all issued books
- Auto fine calculation
- Dashboard with statistics

### 👨‍🎓 Student
- Register and login
- Search books by title, author, category
- Borrow available books
- View borrowed books and due dates
- Check fine amount

## 📁 Project Structure
library-management/
├── backend/
│ ├── config/
│ │ └── db.js
│ ├── controllers/
│ │ ├── authController.js
│ │ ├── bookController.js
│ │ └── issueController.js
│ ├── routes/
│ │ ├── auth.js
│ │ ├── books.js
│ │ └── issue.js
│ └── server.js
└── frontend/
└── src/
├── components/
│ └── Navbar.js
├── pages/
│ ├── Login.js
│ ├── Register.js
│ ├── AdminDashboard.js
│ ├── StudentDashboard.js
│ ├── Books.js
│ └── MyBooks.js
└── utils.js

## ⚙️ Installation & Setup

### Prerequisites
- Node.js
- XAMPP (MySQL)

### Backend Setup
```bash
cd backend
npm install
node server.js
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Database Setup
- Start XAMPP MySQL
- Open phpMyAdmin
- Create database: `library_db`
- Import the SQL schema

## 👤 Default Admin Login
- Email: admin@library.com
- Password: password

## 📸 Screenshots
Coming soon...

## 🎓 About
Built by Kaif — B.E. Artificial Intelligence Engineering Student at KLE Engineering College, Belgaum, Karnataka.

## 📄 License
MIT License