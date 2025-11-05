import * as React from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "./App";

const Headlines = React.lazy(() => import("./pages/Headlines"));
const Search = React.lazy(() => import("./pages/Search"));
const Sources = React.lazy(() => import("./pages/Sources"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Headlines /> },
      { path: "search", element: <Search /> },
      { path: "sources", element: <Sources /> },
    ],
  },
]);
