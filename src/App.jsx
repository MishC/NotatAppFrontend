import NoteApp from "./components/NoteApp";
import {  Routes, Route, Navigate } from "react-router-dom";

import "./App.css";

function App() {
  return (
    <div className="App mb-[250px]">
        <Routes>
          <Route path="/" element={<NoteApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </div>
  );
}

export default App;
