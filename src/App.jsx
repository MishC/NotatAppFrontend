import NoteApp from "./components/NoteApp";
import {  Routes, Route, Navigate } from "react-router-dom";
import Authorization from "./components/Authorization";
import Subscribe from   "./components/Subscribe";

import "./App.css";

function App() {
  return (
    <div className="App mb-[250px]">
        <Routes>
          <Route path="/" element={<NoteApp />} />
          <Route path="/auth" element={<Authorization/>}/>
          <Route path="/subscribe" element={Subscribe}/>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </div>
  );
}

export default App;
