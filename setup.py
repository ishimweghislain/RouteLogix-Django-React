#!/usr/bin/env python3
"""
RouteLogix Setup Script
Automated setup for the RouteLogix ELD & Trip Planning System
"""
import os
import sys
import subprocess
import platform

def run_command(command, cwd=None):
    """Run a shell command and return success status"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error running command: {command}")
            print(f"Error output: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"Exception running command {command}: {e}")
        return False

def setup_backend():
    """Setup the Django backend"""
    print("🔧 Setting up Django backend...")
    
    backend_dir = os.path.join(os.getcwd(), 'backend')
    
    # Create virtual environment
    print("Creating Python virtual environment...")
    if not run_command("python -m venv venv", cwd=backend_dir):
        return False
    
    # Install dependencies
    print("Installing Python dependencies...")
    if platform.system() == "Windows":
        pip_cmd = "venv\\Scripts\\pip.exe"
    else:
        pip_cmd = "venv/bin/pip"
    
    dependencies = [
        "django==5.2.7",
        "djangorestframework",
        "mysqlclient", 
        "django-cors-headers",
        "requests",
        "python-dotenv"
    ]
    
    for dep in dependencies:
        if not run_command(f"{pip_cmd} install {dep}", cwd=backend_dir):
            print(f"Failed to install {dep}")
            return False
    
    # Run migrations
    print("Running database migrations...")
    if platform.system() == "Windows":
        python_cmd = "venv\\Scripts\\python.exe"
    else:
        python_cmd = "venv/bin/python"
    
    if not run_command(f"{python_cmd} manage.py makemigrations", cwd=backend_dir):
        print("Warning: Could not create migrations (database might not be running)")
    
    if not run_command(f"{python_cmd} manage.py migrate", cwd=backend_dir):
        print("Warning: Could not run migrations (database might not be running)")
    
    print("✅ Backend setup completed!")
    return True

def setup_frontend():
    """Setup the React frontend"""
    print("🔧 Setting up React frontend...")
    
    frontend_dir = os.path.join(os.getcwd(), 'frontend')
    
    # Install Node.js dependencies
    print("Installing Node.js dependencies...")
    if not run_command("npm install", cwd=frontend_dir):
        return False
    
    print("✅ Frontend setup completed!")
    return True

def create_demo_data():
    """Create demo data for testing"""
    print("📊 Creating demo data...")
    
    backend_dir = os.path.join(os.getcwd(), 'backend')
    
    if platform.system() == "Windows":
        python_cmd = "venv\\Scripts\\python.exe"
    else:
        python_cmd = "venv/bin/python"
    
    if run_command(f"{python_cmd} create_demo_data.py", cwd=backend_dir):
        print("✅ Demo data created successfully!")
        return True
    else:
        print("⚠️  Could not create demo data (database might not be running)")
        return False

def main():
    """Main setup function"""
    print("🚀 RouteLogix Setup Script")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not (os.path.exists('backend') and os.path.exists('frontend')):
        print("❌ Please run this script from the RouteLogix root directory")
        print("   (The directory should contain 'backend' and 'frontend' folders)")
        sys.exit(1)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    
    # Check if Node.js is installed
    if not run_command("node --version"):
        print("❌ Node.js is required. Please install Node.js 18+ and try again.")
        sys.exit(1)
    
    print("✅ Prerequisites check passed!")
    print()
    
    # Setup backend
    if not setup_backend():
        print("❌ Backend setup failed")
        sys.exit(1)
    
    print()
    
    # Setup frontend  
    if not setup_frontend():
        print("❌ Frontend setup failed")
        sys.exit(1)
    
    print()
    
    # Create demo data (optional)
    print("🎯 Would you like to create demo data for testing? (y/n): ", end="")
    try:
        response = input().lower().strip()
        if response in ['y', 'yes']:
            create_demo_data()
    except KeyboardInterrupt:
        print("\n⏭️  Skipping demo data creation")
    
    print()
    print("🎉 Setup completed successfully!")
    print()
    print("📋 Next steps:")
    print("1. Start MySQL server (XAMPP recommended)")
    print("2. Start the backend server:")
    print("   cd backend")
    if platform.system() == "Windows":
        print("   venv\\Scripts\\activate")
    else:
        print("   source venv/bin/activate")
    print("   python manage.py runserver")
    print()
    print("3. In a new terminal, start the frontend server:")
    print("   cd frontend")
    print("   npm start")
    print()
    print("4. Open your browser to http://localhost:3000")
    print()
    print("🚛 Happy trucking with RouteLogix!")

if __name__ == "__main__":
    main()
