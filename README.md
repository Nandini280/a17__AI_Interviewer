# AI Interviewer - Cloud Based Resume Practice System

A full-stack web application for practicing interviews with AI-generated questions based on your resume.

## Features

- **User Authentication**: Sign up, login, and profile management
- **Resume Upload & Parsing**: Upload PDF/DOC resumes with automatic skill extraction
- **AI-Powered Interviews**: Generate personalized interview questions based on your skills
- **Text & Voice Mode**: Answer questions via typing or voice recording
- **Real-time Evaluation**: Get instant feedback with detailed scoring
- **Performance Analytics**: Track progress with detailed reports and charts

## Tech Stack

### Frontend
- React.js 18+
- React Router for navigation
- Framer Motion for animations
- Lucide React for icons
- Axios for API calls

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- pdf-parse & mammoth for document parsing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### 1. Clone the repository
```
bash
cd AI-Interview
```

### 2. Backend Setup
```
bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```
env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai-interviewer
JWT_SECRET=your-secret-key
```

Start the backend server:
```
bash
npm start
```

### 3. Frontend Setup
```
bash
cd frontend
npm install
```

Start the frontend:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Resume
- `POST /api/resume/upload` - Upload and parse resume
- `GET /api/resume/skills` - Get extracted skills
- `GET /api/resume` - Get user resume
- `DELETE /api/resume` - Delete resume

### Interview
- `POST /api/interview/start` - Start new interview
- `GET /api/interview/:id/questions` - Get interview questions
- `POST /api/interview/:id/answer` - Submit answer
- `POST /api/interview/:id/finish` - Finish interview
- `GET /api/interview/results/:id` - Get interview results
- `GET /api/interview/history` - Get past interviews

## Usage

1. **Sign Up** - Create an account
2. **Upload Resume** - Upload a PDF or DOC file containing your resume
3. **Start Interview** - Click "Start Mock Interview" to begin
4. **Answer Questions** - Answer 5 questions (3 technical, 1 HR, 1 behavioral)
5. **View Results** - See detailed feedback and scores

## Project Structure

```
AI-Interview/
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       ├── context/
│       │   └── AuthContext.js
│       ├── pages/
│       │   ├── Landing.js
│       │   ├── Login.js
│       │   ├── Signup.js
│       │   ├── Dashboard.js
│       │   ├── Profile.js
│       │   ├── Interview.js
│       │   ├── Results.js
│       │   └── PastInterviews.js
│       ├── App.js
│       └── index.js
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Resume.js
│   │   │   └── Interview.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── resume.js
│   │   │   └── interview.js
│   │   └── server.js
│   ├── uploads/
│   └── package.json
└── README.md
```

## License

MIT License
