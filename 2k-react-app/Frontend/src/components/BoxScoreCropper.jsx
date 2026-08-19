import { useState, useRef } from "react";
import { Button } from "react-bootstrap";

function BoxScoreCropper({ imageUrl, onCrop }) {

   const imageRef = useRef(null);

   const [startPoint, setStartPoint] = useState(null);
   const [cropArea, setCropArea] = useState(null);
   const [dragging, setDragging] = useState(false);

   const handleMouseDown = (e) => {
      const rect = imageRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setStartPoint({ x, y });
      setDragging(true);
   };

   const handleMouseMove = (e) => {
      if (!dragging || !startPoint) {
         return;
      }
      const rect = imageRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      setCropArea({
         x: Math.min(startPoint.x, currentX),
         y: Math.min(startPoint.y, currentY),
         width: Math.abs(currentX - startPoint.x),
         height: Math.abs(currentY - startPoint.y)
      });
   };

   const handleMouseUp = () => {
      setDragging(false);
   };

   const handleCrop = () => {
      if (!cropArea) {
         return;
      }
      onCrop(cropArea);
   };


   return (
      <div>
         <div style={{ position: "relative", display: "inline-block" }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>

            <img ref={imageRef} src={imageUrl} alt="Box score" style={{ maxWidth: "100%", display: "block", userSelect: "none" }} />

            {cropArea &&

               (<div style={{ position: "absolute", left: cropArea.x, top: cropArea.y, width: cropArea.width, height: cropArea.height, border: "2px solid #ff6600", backgroundColor: "rgba(255, 102, 0, 0.15)", pointerEvents: "none" }} />)}
         </div>

         <div className="mt-3 d-flex justify-content-between">
            <Button variant="warning" onClick={handleCrop} disabled={!cropArea}>
               Confirm Crop
            </Button>

            <Button variant="warning" onClick={() => setCropArea(null)} disabled={!cropArea}>
               Reset Crop
            </Button>
         </div>
      </div>
   );
}

export default BoxScoreCropper;