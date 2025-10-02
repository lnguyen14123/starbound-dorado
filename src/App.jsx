import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PetPage from "./components/PetPage";
import TasksPage from "./components/TasksPage";
import StorePage from "./components/StorePage";
import FriendsPage from "./components/FriendsPage";
import SettingsPage from "./components/SettingsPage";

function App() {
  return (
    <Router>
      <nav style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <Link to="/">Pet</Link>
        <Link to="/tasks">Tasks</Link>
        <Link to="/store">Store</Link>
        <Link to="/friends">Friends</Link>
        <Link to="/settings">Settings</Link>
      </nav>

      <Routes>
        <Route path="/" element={<PetPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
