# RouteLogix - ELD & Trip Planning System

A comprehensive full-stack web application for commercial truck drivers that combines trip planning with Electronic Logging Device (ELD) functionality. The app calculates FMCSA Hours of Service (HOS) compliant routes and automatically generates daily log sheets.

## Features

### 🚛 Trip Planning
- Input current location, pickup location, and dropoff location
- Support for both address and GPS coordinates
- Automatic distance and duration calculation
- HOS cycle type selection (70hr/8day or 60hr/7day)

### 🗺️ Interactive Route Map
- Visual route display using Leaflet/OpenStreetMap
- Fuel stop markers every 1,000 miles
- Required rest stop and break period markers
- Real-time trip information overlay
- Responsive design for desktop and mobile

### 📋 ELD Daily Log Sheets
- Automatic log generation based on FMCSA HOS rules
- Visual 24-hour grid display with 15-minute intervals
- Four duty statuses: Off Duty, Sleeper Berth, Driving, On Duty
- Multi-day trip support with automatic log creation
- HOS compliance validation and violation reporting

### 📄 Compliance Features
- FMCSA HOS rules implementation:
  - 11-hour daily driving limit
  - 14-hour duty window
  - 30-minute break after 8 hours of driving
  - 10-hour rest period requirement
  - 70hr/8day or 60hr/7day cycle limits
  - 34-hour restart capability
- PDF export for compliance documentation
- Violation tracking and reporting

## Tech Stack

### Backend (Django)
- **Django 5.2.7** - Web framework
- **Django REST Framework** - API development
- **MySQL** - Database (Ghislainwork)
- **django-cors-headers** - CORS handling
- **Python 3.12+** - Programming language

### Frontend (React)
- **React 18** with TypeScript - UI framework
- **Tailwind CSS 3.4.0** - Styling
- **React Router** - Navigation
- **Leaflet + React-Leaflet** - Interactive maps
- **Axios** - HTTP client
- **jsPDF + html2canvas** - PDF generation

## Installation

### Prerequisites
- Python 3.12+
- Node.js 18+
- MySQL Server (XAMPP recommended)
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RouteLogix/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install django djangorestframework mysqlclient django-cors-headers requests python-dotenv
   ```

4. **Start MySQL (XAMPP)**
   - Start XAMPP Control Panel
   - Start Apache and MySQL services
   - The database "Ghislainwork" will be created automatically

5. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start development server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**
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
