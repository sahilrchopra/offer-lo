# offerlo
Goal: Build a scalable system for personalized email campaigns with an intuitive admin interface.

This project is a full-stack web application that allows administrators to:

Create and edit email templates stored in a database

Assign promotional offers to users 

Send personalized emails to users based on their assigned offers

# Features
## Admin Dashboard

Manage email templates with support for dynamic variables

Assign offers to users 

Preview email templates before sending

## User & Offer Management

Store and manage user data including email addresses and usernames

Define different promotional offers and discount codes

Track which users have been assigned specific offers

# Technology Stack
## Frontend
React.js with functional components and hooks

React Router for navigation

Axios for API communication

Material-UI for UI components


## Backend
Node.js with Express.js framework

Mysql for database


## Collections:

users - User information and preferences

offers - Promotion details and metadata

templates - Email template content and variables

# Installation & Setup

## Prerequisites
- Node.js (v14 or newer)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

## Getting Started

### Clone the repository
```bash
git clone https://github.com/yourusername/offer-lo.git
cd offer-lo
```

### Backend Setup
1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/offerlo
JWT_SECRET=your_jwt_secret_key
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password
```

4. Start the backend server:
```bash
npm run dev
# or
yarn dev
```

5. (Optional) Clear and reset the database (in server terminal):
```bash
node ./scripts/delete_db.js
```

### Frontend Setup
1. Open a new terminal and navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the frontend development server:
```bash
npm start
# or
yarn start
```

4. The application will be available at `http://localhost:3000`

## Building for Production
1. Build the frontend:
```bash
cd client
npm run build
# or
yarn build
```

2. Set NODE_ENV to production in your backend `.env` file:
```
NODE_ENV=production
```

3. Start the production server:
```bash
cd server
npm start
# or
yarn start
```




