import App from "./App";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
// import Dashboard from "./pages/Dashboard"; // Create this for your IoT data

const MainRoutes = () => {
  const routes = [
    {
      path: "/",
      element: <App />,
      children: [
        { index: true, element: <Landing /> },
        { path: "login", element: <Auth /> },
        { path: "signup", element: <Auth /> },
        { path: "dashboard", element: <Dashboard /> },
        
        /*
        {
          element: <ProtectedRoute />,
          children: [
            { path: "dashboard", element: <div>Dashboard with ESP32 Data</div> },
          ],
        },*/
      ],
    },
  ];

  return routes;
};

export default MainRoutes;