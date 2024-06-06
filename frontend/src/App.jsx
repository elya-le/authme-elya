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
import CreateGroupPage from './components/Groups/CreateGroupPage';
import UpdateGroupForm from './components/Groups/UpdateGroupForm';
import CreateEventForm from './components/Events/CreateEventForm';
import UpdateEventForm from './components/Events/UpdateEventForm';
import * as sessionActions from './store/session';

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const getCsrfToken = async () => {
      const response = await fetch('/api/csrf/restore', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      document.cookie = `XSRF-TOKEN=${data['XSRF-Token']}`;
    };

    getCsrfToken(); // Fetch CSRF token on app initialization

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
      { path: '/', element: <LandingPage /> },
      { path: 'signup', element: <SignupFormModal /> },
      { path: 'groups', element: <GroupListPage /> },
      { path: 'groups/:groupId', element: <GroupDetailPage /> },
      { path: 'groups/:groupId/update', element: <UpdateGroupForm /> },
      { path: 'groups/:groupId/events', element: <CreateEventForm /> },
      { path: 'events', element: <EventListPage /> },
      { path: 'events/:eventId', element: <EventDetailPage /> },
      { path: 'events/:eventId/update', element: <UpdateEventForm /> },
      { path: 'groups/new', element: <CreateGroupPage /> }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
