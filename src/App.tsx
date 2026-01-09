import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { QuizList } from "./components/QuizList";
import { UserManagement } from "./components/UserManagement";
import { AuthProvider } from "./contexts/AuthContext";

import { TestComponent } from "./components/TestComponent";
import GameClient from "./games/GameClient";
import { LeaderboardMock } from "./test/LeaderboardMock";
import { WinnerScreenMock } from "./test/WinnerScreenMock";
import { QuestionWithImageMock } from "./test/QuestionWithImageMock";
import { QuestionWithoutImageMock } from "./test/QuestionWithoutImageMock";
import { QuestionScreenMock } from "./test/QuestionScreenMock";

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
          <Route path="/leaderboard-mock" element={<LeaderboardMock />} />
          <Route path="/winner-mock" element={<WinnerScreenMock />} />
          <Route
            path="/server-question-mock"
            element={<QuestionWithImageMock />}
          />
          <Route
            path="/server-question-no-image-mock"
            element={<QuestionWithoutImageMock />}
          />
          <Route
            path="/client-question-mock"
            element={<QuestionScreenMock />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
