# PrepAcademy - AI-Powered Test Prep

PrepAcademy is a comprehensive web and mobile application designed to help high school students achieve higher scores on the SAT and ACT exams. The platform leverages artificial intelligence to adapt to individual learning styles and knowledge levels, providing a personalized study experience.

## Features

- **Diagnostic Tests**: Assess your current knowledge across all SAT/ACT subjects and determine your optimal learning style.
- **Adaptive Study Plans**: Get a personalized study roadmap that adapts to your progress and focuses on areas that need improvement.
- **Full Practice Exams**: Take full-length, timed tests that simulate the real SAT/ACT experience with adaptive difficulty.
- **AI Assistant**: Receive hints, explanations, and study recommendations tailored to your learning style.
- **Unlimited Practice Questions**: Access thousands of practice questions with detailed explanations.
- **Performance Tracking**: Monitor your progress with detailed analytics showing improvement over time.

## Tech Stack

### Frontend
- React.js with TypeScript
- Tailwind CSS for styling
- Chart.js for data visualization
- React Router for navigation

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- TypeScript for type safety

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/prep-academy.git
cd prep-academy
```

2. Install dependencies for the root project, client, and server
```bash
# Root project dependencies
npm install

# Client dependencies
cd client
npm install
cd ..

# Server dependencies
cd server
npm install
cd ..
```

3. Set up environment variables
```bash
# In server directory, create a .env file
PORT=5000
MONGODB_URI=mongodb://localhost:27017/prep-academy
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

4. Start the development servers
```bash
# Start the server (from server directory)
npm run dev

# Start the client (from client directory)
npm start
```

## Project Structure

```
prep-academy/
├── client/                # React frontend
│   ├── public/            # Public assets
│   │   ├── src/           # Source code
│   │   │   ├── components/    # Reusable components
│   │   │   ├── context/       # React context for state management
│   │   │   ├── pages/         # Page components
│   │   │   └── ...            # Other frontend files
│   │   └── ...
│   └── ...
├── server/                # Node.js backend
│   ├── src/               # Source code
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   └── ...            # Other backend files
│   └── ...
└── ...
```

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/prep-academy](https://github.com/yourusername/prep-academy) 