import "./App.css";
import LiveDashboard from "./components/LiveDashboard";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div>
          <Router>
            <Routes>
              <Route path="/" element={<Navigate replace to="/asset" />} />
              <Route path="/asset/*" element={<LiveDashboard />} />
              <Route path="*" element={<Navigate replace to="/asset" />} />
            </Routes>
          </Router>
        </div>
      </header>
    </div>
  );
}

export default App;
