import BaseAuthentication from './Authentication/BaseAuthentication.jsx';
import BaseDashboard from './Dashboard/BaseDashboard.jsx';

import Home from './Authentication/home.jsx';
import Login from './Authentication/login.jsx';
import Register from './Authentication/register.jsx';

import DashboardHome from './Dashboard/DashboardHome.jsx';
import AddGames from './Dashboard/AddGames.jsx';
import Stats from './Dashboard/Stats.jsx';
import Profile from './Dashboard/Profile.jsx';

import { useState } from 'react';


function App() {
    const [currentPage, setCurrentPage] = useState('home');

    const authPages = ['home', 'login', 'register']
    const dashboardPages = ['addBuild', 'addFriends', 'addGames', 'dashboardHome', 'editProfile', 'friends', 'profile', 'stats']

    const renderPage = () => {
        //Every page that is designed to be able to navigate between within there set code (not the navbar) pages will need the setCurrentPage={setCurrentPage}
        switch (currentPage) {
            case 'home':
                return ( <Home setCurrentPage={setCurrentPage}/> );
            case 'login':
                return ( <Login setCurrentPage={setCurrentPage}/> );
            case 'register':
                return ( <Register setCurrentPage={setCurrentPage}/> );

            case 'dashboardHome':
                return ( <DashboardHome setCurrentPage={setCurrentPage}/> );
            case 'addGames':
                return ( <AddGames setCurrentPage={setCurrentPage}/> );
            case 'stats':
                return ( <Stats setCurrentPage={setCurrentPage}/> );

            case 'profile':
                return ( <Profile setCurrentPage={setCurrentPage}/> );

            default:
                return ( <Home /> );
        }
    };

if (authPages.includes(currentPage)) {
    return (
        <BaseAuthentication setCurrentPage={setCurrentPage}>
            {renderPage()}
        </BaseAuthentication>
    );
}

if (dashboardPages.includes(currentPage)) {
    return (
        <BaseDashboard setCurrentPage={setCurrentPage}>
            {renderPage()}
        </BaseDashboard>
    );
}


// Need to actually fix this to show an error page, maybe say 'an unknown error has occured, please login again
return (
    <BaseAuthentication setCurrentPage={setCurrentPage}> 
        {renderPage()}
    </BaseAuthentication>
    );
}

export default App;
