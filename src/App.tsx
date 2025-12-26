import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { QuizList } from "./components/QuizList";
import { UserManagement } from "./components/UserManagement";
import { AuthProvider } from "./contexts/AuthContext";

import { TestComponent } from "./components/TestComponent";
import GameClient from "./games/GameClient";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute teacherOrAdmin>
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
          <Route path="/ws-test" element={<TestComponent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
