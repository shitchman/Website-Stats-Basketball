import BaseAuthentication from './components/AuthenticationNavbar.jsx';
import BaseDashboard from './components/DashboardNavbar.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

import DashboardHome from './pages/DashboardHome.jsx';
import AddGames from './pages/AddGames.jsx';
import Stats from './pages/Stats.jsx';
import Profile from './pages/Profile.jsx';

import { useState } from 'react';


function App() {

    const [user, setUser] = useState(null);
    const [currentPage, setCurrentPage] = useState('home');
    
    const authPages = ['home', 'login', 'register']
    const dashboardPages = ['addGames', 'dashboardHome', 'profile', 'stats', 'addBuild']

    const renderPage = () => {
        //Every page that is designed to be able to navigate between within there set code (not the navbar) pages will need the setCurrentPage={setCurrentPage}
        switch (currentPage) {
            case 'home':
                return (<Home setCurrentPage={setCurrentPage} />);
            case 'login':
                return (<Login setCurrentPage={setCurrentPage} setUser={setUser} />);
            case 'register':
                return (<Register setCurrentPage={setCurrentPage} />);

            case 'dashboardHome':
                return (<DashboardHome user={user} />);
            case 'addGames':
                return (<AddGames />);
            case 'stats':
                return (<Stats />);
            case 'profile':
                return (<Profile user={user} setUser={setUser} />);

            default:
                return (<Home />);
        }
    };

    if (authPages.includes(currentPage)) {
        return (
            <BaseAuthentication setCurrentPage={setCurrentPage} currentPage={currentPage}>
                {renderPage()}
            </BaseAuthentication>
        );
    }

    if (dashboardPages.includes(currentPage)) {
        return (
            <BaseDashboard setCurrentPage={setCurrentPage} currentPage={currentPage} setUser={setUser}>
                {renderPage()}
            </BaseDashboard>
        );
    }


    // Need to actually fix this to show an error message, maybe say 'an unknown error has occured, please login again
    return (
        <BaseAuthentication setCurrentPage={setCurrentPage} currentPage={currentPage}>
            {renderPage()}
        </BaseAuthentication>
    );
}

export default App;
