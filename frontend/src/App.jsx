import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginFormPage from './components/LoginFormPage/LoginFormPage';

// function App() {
//   return <h1> Hedoo </h1>;
// }

const router = createBrowserRouter([
  {
    path: '/',
    element: <h1>heddo</h1>
  },
  {
    path: '/login',
    element: <LoginFormPage />
  }
]);

const App = () => {
  return <RouterProvider router={router} />;
};



export default App;
