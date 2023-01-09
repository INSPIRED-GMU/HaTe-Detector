import { Routes, Route } from "react-router-dom";
import './App.css';
import Landing from './components/Landing';
import Workspace from './components/Workspace';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/workspace" element={<Workspace />} />
    </Routes>
  );
}

export default App;
