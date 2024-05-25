import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import SignupFormModal from './components/SignupFormModal/SignupFormModal';
import Navigation from './components/Navigation/Navigation';
import LandingPage from './components/LandingPage/LandingPage';
import GroupListPage from './components/Groups/GroupListPage'; 
import GroupDetailPage from './components/Groups/GroupDetailPage';
import EventListPage from './components/Events/EventListPage';
import EventDetailPage from './components/Events/EventDetailPage';
import * as sessionActions from './store/session';

function Layout() {
    const dispatch = useDispatch();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        dispatch(sessionActions.restoreUser()).then(() => {
            setIsLoaded(true);
        });
    }, [dispatch]);

    return (
        <>
            <Navigation isLoaded={isLoaded} />
            {isLoaded && <Outlet />}
        </>
    );
}

const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            {
                path: '/',
                element: <LandingPage />
            },
            {
                path: 'signup',
                element: <SignupFormModal />
            },
            {
                path: 'groups',
                element: <GroupListPage /> 
            },
            {
                path: 'groups/:groupId',
                element: <GroupDetailPage /> 
            },
            {
                path: 'events',
                element: <EventListPage />
            },
            {
                path: 'events/:eventId',
                element: <EventDetailPage /> 
            }
        ]
    }
],
    {
    basename: process.env.NODE_ENV === 'production' ? '' : ''
    }
);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
