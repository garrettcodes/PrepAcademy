# PrepAcademy

A comprehensive platform for SAT/ACT preparation, featuring adaptive learning, performance tracking, and personalized study plans.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Content Management System](#content-management-system)
- [Testing](#testing)
- [Deployment](#deployment)

## Features

- **Personalized Study Plans**: Generate custom study plans based on diagnostic tests and user goals
- **Practice Questions and Exams**: Access a comprehensive database of practice questions and full-length exams
- **Performance Analytics**: Track progress across subjects and question types
- **Content Quality Control**: System for experts to review and update content for accuracy
- **SAT/ACT Updates**: Stay current with the latest test format changes
- **Offline Mode**: Access study materials even without internet connection
- **Cross-device Compatibility**: Use on any device with a consistent experience
- **Study Groups**: Create or join study groups to collaborate with peers on test preparation
- **Shared Notes**: Share and access notes within study groups or make them public to the community
- **Feedback System**: Submit feedback on the platform, with history tracking for users and management tools for administrators

## Tech Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Testing**: Jest, Puppeteer for end-to-end and cross-device testing
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/prep-academy.git
cd prep-academy
```

2. Install dependencies for both client and server
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables
   - Create a `.env` file in the server directory with the following variables:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Start the development servers
```bash
# Start server (from server directory)
npm run dev

# Start client (from client directory)
npm start
```

## Content Management System

PrepAcademy includes a comprehensive content quality management system to ensure accuracy and alignment with current SAT/ACT standards.

### Content Review Process

1. **Flagging Content**: Users can flag content that may be inaccurate or outdated by clicking the flag icon on any question or exam.

2. **Review by Experts**: Subject matter experts review flagged content through the admin panel:
   - Navigate to `/admin/reviews` to see all flagged content
   - Review each item for accuracy and clarity
   - Update content or mark as reviewed

3. **SAT/ACT Updates**: Admins can update content based on changes to standardized test formats:
   - Navigate to `/admin/sat-act-updates` to create and manage updates
   - Reference official documentation when making changes
   - All changes are tracked and logged for future reference

### Admin Roles

- **Subject Matter Experts**: Can review and update content in specific subject areas
- **Administrators**: Have full access to all system features and can manage users

To create an admin or expert account:

1. Register a regular user account
2. Use the MongoDB shell or admin dashboard to update the user's role:
```javascript
// Example MongoDB update
db.users.updateOne(
  { email: "expert@example.com" },
  { $set: { role: "expert", expertise: ["Math", "Science"] } }
)
```

## Testing

PrepAcademy includes comprehensive testing capabilities to ensure quality and compatibility.

### Running Tests

```bash
# Run all tests
npm run test:all

# Run only unit tests
npm test

# Run end-to-end tests
npm run test:e2e

# Run device compatibility tests
npm run test:device
```

### End-to-End Testing

End-to-end tests verify complete user flows, including:
- Authentication
- Content review process
- Exam experience
- Study plan creation and progress tracking
- Offline functionality

### Cross-Device Testing

Device compatibility tests check the application across different devices:
- Desktop (various resolutions)
- Tablet (iPad Pro, etc.)
- Mobile (iPhone X, etc.)

Tests verify:
- Responsive design
- Touch interactions
- Offline functionality
- Performance on various devices

## Deployment

PrepAcademy is deployed using Vercel for both frontend and backend:

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy using Vercel's automated deployment pipeline

For manual deployment:

```bash
# Build frontend
cd client
npm run build

# Build backend
cd ../server
npm run build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- All subject matter experts and educators who contributed to content creation
- The React and Node.js communities for their excellent documentation
- MongoDB for flexible data storage capabilities

## Contact

Your Name - your.email@example.com

Project Link: [https://github.com/garrettcodes/prepacademy](https://github.com/garrettcodes/prepacademy) 
