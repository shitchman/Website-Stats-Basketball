// import { useEffect } from "react";

// function AddGames() {

//     useEffect(() => {
//         document.title = "Hoop Stats - Add Games";
//     }, []);

//     return (
//         <div className="row justify-content-center">

//             <div className="container">
//                 <h1>This is where you add games by uploading (or taking?) photos </h1>
//             </div>

//             <div>
//                 <p></p>
//             </div>
//         </div>
//     );

// }

// export default AddGames;


import { Card } from "react-bootstrap";

function HeroCard() {
  return (
    <Card className="hero-card mb-4">
      <div className="hero-glow hero-glow-top-right"></div>
      <div className="hero-glow hero-glow-top-left"></div>

      <Card.Body className="hero-content text-white">
        <h1>
          This doesnt look like its going to work very quickly
        </h1>

        <p>
          Your content goes here
        </p>
      </Card.Body>
    </Card>
  );
}

export default HeroCard;