import App from "./App";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";

const MainRoutes = () => {
  const routes = [
    {
      path: "/",
      element: <App />,
      children: [
        { index: true, element: <Landing /> },
        { path: "login", element: <Auth /> },
        { path: "signup", element: <Auth /> },
        
        
      ],
    },
  ];

  return routes;
};

export default MainRoutes;