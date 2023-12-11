import logo from "./logo.svg";
import "./App.css";
import Header2 from "./components/Header";
import LiveDashboard from "./components/LiveDashboard";

function App() {
  return (
    <div className="App">
      <Header2 />
      <header className="App-header">
        <div>
          <LiveDashboard />
        </div>
      </header>
    </div>
  );
}

export default App;
