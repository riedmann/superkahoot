import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QuizList } from "./components/QuizList";
import { GameClient } from "./games/GameClient";
import { TestActiveQuestion } from "./test/TestActiveQuestion";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<QuizList />} />
        <Route path="/" element={<GameClient />} />
        <Route path="/test" element={<TestActiveQuestion />} />
      </Routes>
    </Router>
  );
}

export default App;
