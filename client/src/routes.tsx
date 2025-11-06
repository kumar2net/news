import * as React from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import ErrorFallback from "./components/ErrorFallback";

const Headlines = React.lazy(() => import("./pages/Headlines"));
const Search = React.lazy(() => import("./pages/Search"));
const Sources = React.lazy(() => import("./pages/Sources"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorFallback />,
    children: [
      { index: true, element: <Headlines />, errorElement: <ErrorFallback /> },
      { path: "search", element: <Search />, errorElement: <ErrorFallback /> },
      { path: "sources", element: <Sources />, errorElement: <ErrorFallback /> },
    ],
  },
]);
