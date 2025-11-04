import NoteApp from "./components/NoteApp";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import "./App.css";

function App() {
  return (
    <div className="App mb-[250px]">
      <Router>
        <Routes>
          <Route path="/" element={<NoteApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
