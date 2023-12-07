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
          <img src={logo} className="App-logo" alt="logo" />
          <img src={logo} className="App-logo" alt="logo" />
        </div>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
