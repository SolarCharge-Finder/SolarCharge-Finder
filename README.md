# SolarCharge Finder

A MERN stack application for finding solar charging stations.

## Project Structure

```
SolarCharge-Finder/
├── backend/           # Express + MongoDB API
│   ├── config/        # Database and configuration files
│   ├── controllers/   # Route controllers
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   └── server.js      # Entry point
├── client/            # React + Vite frontend
│   ├── src/           # React source files
│   └── public/        # Static assets
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd SolarCharge-Finder
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../client
npm install
```

### Configuration

1. Backend environment variables:
   - Copy `.env.example` to `.env` in the backend directory
   - Update the MongoDB URI and JWT secret

2. Frontend environment variables:
   - Create a `.env` file in the client directory
   - Add: `VITE_API_URL=http://localhost:5000/api`

### Running the Application

1. Start MongoDB (if running locally):
```bash
mongod
```

2. Start the backend server:
```bash
cd backend
npm run dev
```

3. Start the frontend development server:
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Available Scripts

### Backend
- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon

### Frontend
- `npm run dev` - Start the Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

### Backend
- Express.js - Web framework
- MongoDB - Database
- Mongoose - ODM
- JWT - Authentication
- bcryptjs - Password hashing
- dotenv - Environment variables

### Frontend
- React 18 - UI library
- Vite - Build tool
- React Router DOM - Routing
- Axios - HTTP client
- ESLint - Code linting

## License

ISC
   ```
   MONGO_URI=mongodb://localhost:27017/solarcharge-finder
   PORT=5000
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /` - Welcome message

## Contributing

Feel free to contribute to this project.