
# LifeLink - Blood Donation System

A cloud-based blood donation request system that connects blood donors with recipients using Supabase for authentication and database management.

## Features

- **User Authentication**: Register and login with email/password
- **User Roles**: Support for both donors and recipients
- **Blood Request Management**: Create, view, and respond to blood donation requests
- **Real-time Notifications**: Get notified about request updates and responses
- **Interactive Blood Compatibility Chart**: Learn about blood type compatibility
- **Statistics Dashboard**: Visualize donation data and trends
- **Responsive Design**: Works on mobile, tablet, and desktop devices

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT, Supabase Auth
- **Styling**: Custom CSS with responsive design

## Project Structure

```
├── public/               # Frontend assets
│   ├── css/              # CSS stylesheets
│   ├── js/               # JavaScript files
│   └── index.html        # Main HTML file
├── src/                  # Backend source code
│   ├── config/           # Configuration files
│   ├── controllers/      # API controllers
│   ├── middleware/       # Express middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── server.js         # Express server setup
├── .env.example          # Example environment variables
├── index.js              # Application entry point
└── README.md             # Project documentation
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` and fill in your Supabase credentials
4. Run the database setup script:
   ```
   npm run setup-db
   ```
5. Start the application:
   ```
   npm start
   ```

## Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Enable Email/Password authentication in the Authentication settings
3. Add these database tables:
   - `user_profiles`: User information
   - `blood_requests`: Blood donation requests
   - `donor_responses`: Donor responses to requests
   - `notifications`: System notifications

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login user
- `GET /api/auth/me`: Get current user profile
- `PUT /api/auth/profile`: Update user profile

### Blood Requests
- `GET /api/requests`: Get all blood requests
- `POST /api/requests`: Create a new blood request
- `GET /api/requests/:id`: Get a specific blood request
- `PUT /api/requests/:id/status`: Update request status
- `POST /api/requests/:id/respond`: Respond to a blood request

### Donors
- `GET /api/donors/search`: Search for donors by blood group
- `GET /api/donors/stats`: Get donor statistics
- `GET /api/donors/eligible/:requestId`: Get eligible donors for a request

### Notifications
- `GET /api/notifications`: Get notifications for current user
- `PUT /api/notifications/:id/read`: Mark notification as read
- `PUT /api/notifications/read-all`: Mark all notifications as read


=======
# LifeLink - Blood Donation Request System

LifeLink is a cloud-based full stack web application that connects blood donors with recipients and hospitals efficiently. It is designed to streamline the process of finding and requesting blood, promoting a life-saving network.


---

## 🛠️ Technologies Used

### 🌐 Frontend
- HTML5
- CSS3
- JavaScript

### ⚙️ Backend
- Node.js
- Express.js

### ☁️ Cloud & Database
- Supabase (PostgreSQL-based backend as a service)
- Replit (for development and deployment)

---

## 🚀 Features

- 🔍 Search for available blood donors by blood group and location
- 📝 Register as a donor with contact and blood details
- 📬 Raise blood donation requests and track status
- 📢 Email notifications to available donors
- 📈 Admin dashboard to manage users and requests

---
## Screenshots

![Screenshot 2025-05-18 092846](https://github.com/user-attachments/assets/eff56542-6216-418e-b517-8d3d713a4bba)

![Screenshot 2025-05-18 092908](https://github.com/user-attachments/assets/b861b108-339b-4fe6-a6f8-561b9ce7ba6d)





![Screenshot 2025-05-18 092951](https://github.com/user-attachments/assets/0885b50a-d74c-42b2-9121-fd211fa4e667)


![Screenshot 2025-05-18 093421](https://github.com/user-attachments/assets/0107e90d-ff27-4bdf-b828-4a24143093aa)












