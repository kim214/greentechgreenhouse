import App from "./App";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import FeatureIrrigation from "./pages/FeatureIrrigation";
import FeatureVentilation from "./pages/FeatureVentilation";
import FeatureMonitoring from "./pages/FeatureMonitoring";
import FeatureSentry from "./pages/FeatureSentry";

const MainRoutes = () => {
  const routes = [
    {
      path: "/",
      element: <App />,
      children: [
        { index: true, element: <Landing /> },
        { path: "login", element: <Auth /> },
        { path: "signup", element: <Auth /> },
        { path: "auth", element: <Auth /> },
        { path: "forgot-password", element: <ForgotPassword /> },
        { path: "reset-password", element: <ResetPassword /> },
        { path: "dashboard", element: <Dashboard /> },
        { path: "settings", element: <Settings /> },
        { path: "feature/irrigation", element: <FeatureIrrigation /> },
        { path: "feature/ventilation", element: <FeatureVentilation /> },
        { path: "feature/monitoring", element: <FeatureMonitoring /> },
        { path: "feature/sentry", element: <FeatureSentry /> },
        
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