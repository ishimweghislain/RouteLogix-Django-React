# RouteLogix - ELD & Trip Planning System

A comprehensive full-stack web application for commercial truck drivers that combines trip planning with Electronic Logging Device (ELD) functionality.

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.12+
- Node.js 18+
- SQLite (included) or MySQL (optional)
- Git

## 🛠️ Setup Instructions

### 1. Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up the database**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create a superuser (admin) account**
   ```bash
   python manage.py createsuperuser
   ```
   Follow the prompts to create an admin account.

6. **Create a default admin user (username: admin, password: 123)**
   ```bash
   python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@example.com', '123')"
   ```

7. **Start the backend server**
   ```bash
   python manage.py runserver
   ```
   The backend will be available at `http://localhost:8000`

### 2. Frontend Setup

1. **Open a new terminal and navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   The frontend will be available at `http://localhost:3000`

## 🔑 Authentication

### Registration
1. Go to the registration page
2. Fill in all required fields
3. Click "Register"

### Login
1. Go to the login page
2. Enter your username and password
3. Click "Login"

## 🔧 Troubleshooting

### Registration Fails
If you're getting "Registration failed" errors:

1. **Check required fields**: Ensure all required fields are filled
2. **Password requirements**:
   - At least 8 characters
   - Can't be entirely numeric
   - Can't be too similar to username/email
3. **Email format**: Ensure email is in valid format (user@example.com)
4. **Username availability**: The username might already be taken
5. **Check server logs** for detailed error messages

### Login Issues
If you can't log in:

1. **Verify credentials**: Double-check username and password
2. **Account activation**: Ensure your account is active
3. **Server running**: Make sure the backend server is running
4. **Check console errors**: Look for errors in browser's developer console (F12)

### Common Fixes

1. **Clear browser cache** if you're experiencing unexpected behavior
2. **Verify CORS settings** if getting CORS errors:
   - Ensure backend's `CORS_ALLOWED_ORIGINS` includes `http://localhost:3000`
   - Restart backend after making changes

3. **Database issues**:
   ```bash
   # Delete database and migrations
   rm -f db.sqlite3
   find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
   find . -path "*/migrations/*.pyc" -delete
   
   # Recreate database
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser
   ```

## 🖥️ Development

### Backend
- **Admin Interface**: `http://localhost:8000/admin`
- **API Root**: `http://localhost:8000/api/`
- **API Documentation**: `http://localhost:8000/api/docs/`

### Frontend
- **Development Server**: `http://localhost:3000`
- **Hot Reloading**: Enabled by default

## 📦 Dependencies

### Backend
- Django 5.2.7
- Django REST Framework
- SQLite (default) or MySQL
- django-cors-headers
- python-dotenv

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Axios
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Django Admin: http://localhost:8000/admin

## API Endpoints

### Trip Planning
- `POST /api/trip/plan/` - Plan a new trip with HOS compliance
- `GET /api/trips/` - Get all trips
- `GET /api/trips/{id}/` - Get specific trip details

### ELD Logs
- `GET /api/trip/{trip_id}/logs/` - Get complete ELD logs for a trip
- `POST /api/trip/{trip_id}/logs/add/` - Add manual log entry
- `GET /api/trip/{trip_id}/logs/export/pdf/` - Export logs as PDF

## Usage

### Planning a Trip

1. **Enter Trip Details**
   - Current location (e.g., "New York, NY")
   - Pickup location (e.g., "Chicago, IL")
   - Dropoff location (e.g., "Los Angeles, CA")
   - Select HOS cycle type (70hr/8day or 60hr/7day)

2. **Optional: GPS Coordinates**
   - Expand "Advanced Options" to enter precise coordinates
   - Useful for specific loading docks or remote locations

3. **Click "Plan Trip"**
   - System calculates route and HOS compliance
   - Generates automatic fuel stops every 1,000 miles
   - Creates required rest periods and breaks
   - Produces daily log sheets

### Viewing Results

1. **Route Map Tab**
   - Interactive map with complete route
   - Color-coded markers for different stop types
   - Trip summary with distance and time information

2. **Daily Logs Tab**
   - Professional ELD log sheets
   - 24-hour time grids with duty status visualization
   - HOS summary and compliance information
   - Violation reports (if any)
   - PDF export functionality

## FMCSA HOS Rules Implementation

The system implements comprehensive FMCSA Hours of Service regulations:

### Daily Limits
- **11-Hour Driving Limit**: Maximum 11 hours driving per day
- **14-Hour Duty Window**: All driving must occur within 14-hour period
- **30-Minute Break**: Required after 8 cumulative driving hours

### Weekly/Cycle Limits
- **70hr/8day Cycle**: 70 hours maximum in any 8 consecutive days
- **60hr/7day Cycle**: 60 hours maximum in any 7 consecutive days
- **34-Hour Restart**: Reset cycle hours with 34 consecutive hours off duty

### Rest Requirements
- **10-Hour Rest Period**: Required before starting new duty day
- **Sleeper Berth**: 8+ consecutive hours in sleeper berth

## Database Schema

### Key Models
- **Trip**: Route information, locations, distances, HOS cycle
- **RouteStop**: Fuel stops, rest stops, breaks with GPS coordinates
- **DailyLog**: Daily totals and summaries for each trip day
- **LogEntry**: Individual duty status entries with times
- **HOSViolation**: Compliance violations and warnings

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@routelogix.com or create an issue in the repository.

## Acknowledgments

- Federal Motor Carrier Safety Administration (FMCSA) for HOS regulations
- OpenStreetMap contributors for mapping data
- React and Django communities for excellent frameworks
