import type { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Login } from "./Login";

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  teacherOrAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  adminOnly = false,
  teacherOrAdmin = false,
}: ProtectedRouteProps) {
  const { user, isAdmin, isTeacher, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (teacherOrAdmin && !isTeacher && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You need teacher or admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
