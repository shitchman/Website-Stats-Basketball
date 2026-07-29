# Basketball Stats Entry App

A simple Flask web app for entering and saving individual basketball game statistics.

## Setup

1. Create and activate a Python virtual environment.

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies.

```powershell
pip install -r requirements.txt
```

## Run

```powershell
python app.py
```

Then open `http://127.0.0.1:5000/` in your browser.

## Login

The app starts on a home page with login and create-user options.

A preset account is available:

- Username: `AlphaCyclops`
- Password: `2kApp!`

## Features

- Login or register a user account
- Enter player name, game date, and position
- Record points, rebounds, assists, steals, blocks, turnovers, and fouls
- Save entries to local SQLite database
- View saved entries on the stats list page
