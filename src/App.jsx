import NoteApp from "./components/NoteApp";
import {Router,Routes, Route, Redirect} from "react-router-dom";

import "./App.css";

function App() {
  return (
    <div className="App mb-[250px]">
     <Router>
      <Routes>
        <Route path="/" element={<NoteApp />} />
        <Redirect to='/' />

     </Routes>
     </Router>
    </div>
  );
}

export default App;
