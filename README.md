# YouTube Replica - Backend Learning Project

A YouTube clone backend API built while learning backend development from **[Hitesh Choudhary Sir](https://github.com/hiteshchoudhary)** - a fabulous teacher and mentor in web development. This project demonstrates a production-ready backend with comprehensive features, while the frontend development is currently in progress.

## 🎥 Demo

> **Project Status**: The backend API is fully completed and functional (except livestreaming feature). The frontend is currently in early development phase and will be completed soon. Demo link will be added once the frontend is ready for deployment.

## ✨ Features

### Backend API (✅ Completed)

- **User Authentication** - Register, login, logout with JWT
- **Video Management** - Upload, watch, delete videos
- **User Profiles** - View and edit user profiles
- **Search Functionality** - Search for videos and users
- **Dashboard** - Personal dashboard for content creators
- **Subscriptions** - Subscribe/unsubscribe to channels
- **Likes & Dislikes** - Like and dislike videos
- **Comments** - Add, view, and manage comments
- **Playlists** - Create and manage video playlists
- **Tweets** - Share thoughts and updates
- **File Upload** - Cloudinary integration for media storage
- **RESTful API** - Complete backend API with all endpoints

### Frontend (🚧 In Progress)

- **React Application** - Basic structure implemented
- **Redux State Management** - Store configuration ready
- **Component Architecture** - Core components being developed
- **Responsive Design** - Tailwind CSS setup complete
- **API Integration** - Axios configuration ready

### Pending Features

- **Live Streaming** - Backend implementation pending
- **Frontend UI/UX** - Complete user interface development

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI library
- **Vite** - Build tool and development server
- **Redux Toolkit** - State management
- **React Router Dom** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **React Icons** - Icon library
- **Cloudinary React** - Image and video optimization

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File upload middleware
- **Cloudinary** - Cloud storage for media files
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
Youtube-Replica/
├── backend/                 # ✅ Backend API server (Completed)
│   ├── src/
│   │   ├── controllers/     # All route handlers implemented
│   │   ├── models/         # Database schemas complete
│   │   ├── routes/         # Full API routes setup
│   │   ├── middlewares/    # Authentication & file upload middleware
│   │   ├── utils/          # Utility functions and error handling
│   │   └── db/             # Database connection configured
│   ├── public/             # Static file serving
│   └── package.json
└── frontend/               # 🚧 React frontend (Early Development)
    ├── src/
    │   ├── components/     # Basic components structure
    │   ├── pages/          # Page components in progress
    │   ├── Redux/          # State management setup
    │   ├── function/       # Utility functions
    │   └── assets/         # Static assets
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account for media storage

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Prabhat2912/Youtube-Replica.git
   cd Youtube-Replica
   ```

2. **Install Backend Dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**

   ```bash
   cd ../frontend
   npm install
   # or if you prefer pnpm
   pnpm install
   ```

4. **Environment Setup**

   Create a `.env` file in the backend directory:

   ```env
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   CORS_ORIGIN=http://localhost:5173
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=10d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

5. **Start the Development Servers**

   Backend (Fully functional):

   ```bash
   cd backend
   npm run dev
   ```

   Frontend (In development - basic structure):

   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Backend API (Ready): http://localhost:8000
   - Frontend (In progress): http://localhost:5173

## 📡 API Endpoints (✅ Backend Complete)

### Authentication

- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/logout` - User logout
- `POST /api/v1/users/refresh-token` - Refresh access token

### Videos

- `GET /api/v1/videos` - Get all videos
- `POST /api/v1/videos` - Upload new video
- `GET /api/v1/videos/:videoId` - Get video by ID
- `DELETE /api/v1/videos/:videoId` - Delete video

### Users

- `GET /api/v1/users/profile` - Get user profile
- `PATCH /api/v1/users/update-account` - Update account details
- `POST /api/v1/users/change-password` - Change password

### Subscriptions

- `POST /api/v1/subscriptions/:channelId` - Subscribe to channel
- `GET /api/v1/subscriptions/user/:subscriberId` - Get user subscriptions

### Comments, Likes, Playlists, Tweets, Dashboard

- Complete API endpoints implemented for all features

> **Note**: All backend endpoints are fully implemented and tested. You can test the API using tools like Postman or Thunder Client.

## 🔧 Development

### Available Scripts

**Backend:**

- `npm run dev` - Start development server with nodemon

**Frontend:**

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🤝 Contributing

This is a learning project, but contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Learning Outcomes

This backend-focused learning project demonstrates proficiency in:

- **Backend Development** with Node.js and Express.js
- **RESTful API** design and implementation
- **Database Design** and MongoDB operations with Mongoose
- **User Authentication** and authorization with JWT
- **File Upload** and cloud storage integration with Cloudinary
- **Middleware Development** for authentication and file handling
- **Error Handling** and API response standardization
- **Security Best Practices** including password hashing and CORS
- **API Documentation** and project structure organization

## 🐛 Current Status & Known Issues

### Backend (Completed ✅)

- All core features implemented and functional
- Comprehensive API endpoints tested
- Production-ready code structure

### Frontend (In Progress 🚧)

- [ ] Basic React components setup
- [ ] Complete UI/UX implementation needed
- [ ] Redux integration for state management
- [ ] Responsive design implementation
- [ ] Component optimization and styling

### Remaining Features

- [ ] **Live Streaming** capability (backend feature)

## 🚧 Future Enhancements

### Frontend Development (Priority)

- [ ] Complete React frontend implementation
- [ ] Responsive design with Tailwind CSS
- [ ] User interface for all backend features
- [ ] State management with Redux Toolkit
- [ ] Video player component optimization

### Backend Additions

- [ ] **Live Streaming** feature implementation
- [ ] Real-time notifications with WebSocket
- [ ] Advanced search and recommendation algorithm
- [ ] Video transcoding and quality options
- [ ] Analytics and dashboard insights

### Additional Features

- [ ] Mobile application (React Native)
- [ ] Progressive Web App (PWA) features
- [ ] Advanced admin panel

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Prabhat Kumar**

- GitHub: [@Prabhat2912](https://github.com/Prabhat2912)

## 🙏 Acknowledgments

- **Special Thanks** to **[Hitesh Choudhary Sir](https://github.com/hiteshchoudhary)** for his excellent backend development course and mentorship
- Thanks to the open-source community for providing amazing tools and libraries
- Inspired by YouTube's functionality and user experience
- Gratitude to all the developers who contribute to the MERN stack ecosystem
