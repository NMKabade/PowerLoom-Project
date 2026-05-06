# Power Loom Management System

A full-stack application for managing Power Loom operations with Jobers and Owners.

## Tech Stack
- **Backend:** Django 4.2, Django REST Framework, SimpleJWT, SQLite
- **Frontend:** Angular 18 (Standalone), Tailwind CSS

## Prerequisites
- Node.js (v18+)
- Python (v3.8+)
- Angular CLI (`npm i -g @angular/cli`)

## Initial Setup

### Backend
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   ```bash
   .\venv\Scripts\activate
   ```
   *(If on Linux/Mac, use `source venv/bin/activate`)*
3. Apply migrations:
   ```bash
   python manage.py migrate
   ```
4. Create an Owner (Admin) via the Django shell (or register via UI and change role in DB/Admin):
   ```bash
   python manage.py createsuperuser
   ```
   (Then you can log in to `http://localhost:8000/admin` to set users' roles to `ADMIN`)
5. Run the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend
1. Open a separate terminal and navigate to the frontend folder:
   ```bash
   cd powerloom-frontend
   ```
2. Start the Angular development server:
   ```bash
   npm start
   ```
3. Open your browser and navigate to `http://localhost:4200`.

## API Documentation
The API is documented via Swagger UI using `drf-spectacular`. With the backend running, visit:
- Swagger UI: `http://localhost:8000/api/docs/swagger-ui/`
- Schema Download: `http://localhost:8000/api/schema/`
