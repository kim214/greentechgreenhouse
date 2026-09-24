import { Outlet } from "react-router-dom";
import "./App.css";
import { SimulationRunner } from "./components/simulation/SimulationRunner";

const App = () => {
  return (
    <div className="App">
      <SimulationRunner />
      <Outlet />
    </div>
  );
}

export default App;