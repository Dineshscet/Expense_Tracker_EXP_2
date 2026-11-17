@echo off
echo ===================================================
echo Starting ExpenseTrack (Django REST + React Frontend)
echo ===================================================

echo Starting Django backend on http://127.0.0.1:8000 ...
start "ExpenseTrack Backend" cmd /k "cd backend && python manage.py runserver 127.0.0.1:8000"

echo Starting Vite frontend on http://localhost:5173 ...
start "ExpenseTrack Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers have been launched!
echo Open your browser and navigate to: http://localhost:5173
echo ===================================================
pause

