import { Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";
import SupportPage from "./pages/SupportPage";
import DonatePage from "./pages/DonatePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="/apoie" element={<SupportPage />} />
      <Route path="/doar" element={<DonatePage />} />
    </Routes>
  );
}

export default App;
