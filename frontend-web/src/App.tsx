import { Outlet } from "react-router-dom";
import "./App.css";

const App = () => {
  return (
    <div className="App">
      <Outlet />
    </div>
  );
}

export default App;