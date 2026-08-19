import React, { useEffect, useState } from 'react';
import api from './api';

const App = () => {
   const [statlines, setStatlines] = useState([]);

   // 
   useEffect(() => {
      const fetchStatlines = async () => {
         try {
            const response = await api.get('/statlines/');
            setStatlines(response.data || []);
         } catch (error) {
            console.error('Failed to load statlines:', error);
         }
      };

      fetchStatlines();
   }, []);

   return (
      <div className="container py-4">
         <h1>2K React App</h1>
         <p>Backend connected: {statlines.length >= 0 ? 'Yes' : 'No'}</p>

         <ul className="list-group">
            {statlines.length === 0 ? (
               <li className="list-group-item">No statlines yet.</li>
            ) : (
               statlines.map((statline) => (
                  <li key={statline.id ?? statline.gameId} className="list-group-item">
                     Game {statline.gameId}: {statline.points ?? 0} points
                  </li>
               ))
            )}
         </ul>
      </div>
   );
};

export default App;