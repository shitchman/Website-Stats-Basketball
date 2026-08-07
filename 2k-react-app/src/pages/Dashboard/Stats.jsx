// import { useEffect } from "react";

// function Stats() {

//     useEffect(() => {
//         document.title = "Hoop Stats - Stats";
//     }, []);

//     return (
//         <div className="row justify-content-center">

//             <div className="container">
//                 <h1>Your stats will be shown here</h1>
//             </div>

//             <div>
//                 <p>You will will have the option to sort in multiple different ways</p>
//             </div>
//         </div>
//     );
// }

// export default Stats;

import { Card } from "react-bootstrap";

function HeroCard() {
  return (
    <Card className="hero-card mb-4">
      <div className="hero-glow"></div>

      <Card.Body className="hero-content">
        <h1>
          Welcome
        </h1>

        <p>
          Your content goes here
        </p>
      </Card.Body>
    </Card>
  );
}

export default HeroCard;