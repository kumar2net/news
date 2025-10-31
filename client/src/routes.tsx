import * as React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';

const Home = React.lazy(() => import('./pages/Home'));
const Blog = React.lazy(() => import('./pages/Blog'));
const Me = React.lazy(() => import('./pages/Me'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'blog', element: <Blog /> },
      { path: 'me', element: <Me /> },
    ],
  },
]);
