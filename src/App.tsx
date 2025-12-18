import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UserManagement } from "./components/UserManagement";
import { QuizList } from "./components/QuizList";
import { GameClient } from "./games/GameClient";
import { TestActiveQuestion } from "./test/TestActiveQuestion";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <QuizList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute adminOnly>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<GameClient />} />
          <Route path="/test" element={<TestActiveQuestion />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
