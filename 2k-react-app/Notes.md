
HOW TO START APP

Open two terminals in the Frontend folder: cd Frontend

Backend: npm run backend:dev

Frontend: npm run dev

Then open: http://localhost:5173 and http://localhost:8000


CHECKING PROGRESS IN CONSOLE:  console.log("Message:", dataBeingChecked);

REMOVE THE GRIDS ON THE Boxscore output:  Find in code: Delete this once the OCR is working properly
 AND in cd Frontend:

   Remove-Item Env:OCR_TEMPLATE_GRID_DEBUG
   npm run backend:dev


HTTP methods (routers)

| Method     | Typical purpose  | Example                 |
| ---------- | ---------------- | ----------------------- |
| **GET**    | Retrieve         | Get my games            |
| **POST**   | Create           | Create a new game       |
| **PUT**    | Replace/update   | Replace a build         |
| **PATCH**  | Partially update | Change build's position |
| **DELETE** | Delete           | Delete a game           |


Font weight

 - fw-light
 - fw-normal
 - fw-medium
 - fw-semibold
 - fw-bold
 - fw-bolder

Standard variants (color schemes)

| `primary`   | Blue            |
| `secondary` | Grey            |
| `success`   | Green           |
| `danger`    | Red             |
| `warning`   | Yellow/Orange   |
| `info`      | Cyan            |
| `light`     | Light grey      |
| `dark`      | Dark grey/black |

Limiting columns width

 - xs
 - sm
 - md
 - lg
 - xl
 - xxl