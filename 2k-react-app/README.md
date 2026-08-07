# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.




SHORTCUTS
  press r + enter to restart the server
  press u + enter to show server url
  press o + enter to open in browser
  press c + enter to clear console
  press q + enter to quit

  Launch Application: npm run dev





A realistic workflow:
- Take photo
- AI extracts data of users team
- User confirms/corrects
- Save to database
- Generate statistics

Designing Database
 - User
    - Username
    - Password
    - Email
    - Gender
    - Online ID
    - Console

    - Characters
        - Name
        - Height
        - Prefered Position

    - Friends
        - Online ID

        - Characters
            - Name
            - Height
            - Prefered Position
- Games
    - Date
    - Start time / End Time (Will worrk out start time from that)
    - Result
        - End Score
        - Quarter breakdown

    - Player Stats
     - Points
     - Rebounds
     - Assists
     - Steals
     - Blocks
     - Turn Overs
     - Fouls
     - Field Goals Made
     - Field Goals Attempted
     - Field Goal Percentage
     - 3 Point Field Goals Attempted
     - 3 Point Field Goals Made
     - 3 Point Field Goal Percentage
     - Free Throws Attempted
     - Free Throws Made
     - Free Throw Percenatge
     - Opponent 
     - Line Ups
        - Team (User and Friends)
        -   Build
        -   Position
     - Oppenents
        - vs. AI or Player


Frontend - React Native app

Backend - Python FastAPI

Database- PostgreSQL

Image processing- Python + OpenCV + OCR

First release:

User uploads scorecard photo
User confirms extracted stats
App stores player history
Player profile shows stats by position

Then later:

automatic lineup detection
AI performance predictions
team chemistry analysis
