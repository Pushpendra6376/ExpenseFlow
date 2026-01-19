import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components1/ui/toaster";
import { TooltipProvider } from "./components1/ui/tooltip";
import { AuthProvider, useAuth } from "./lib/auth-context";
import { ExpenseProvider } from "./lib/expense-context";
import NotFound from "./pages/not-found";
import LoginPage from "./pages/login1";
import SignupPage from "./pages/signup";
import DashboardPage from "./pages/dashoard";
import AddTransactionPage from "./pages/add-transaction";
import ReportsPage from "./pages/reports";
import ProfilePage from "./pages/profile";

// Custom redirect component for Wouter
function Redirect({ to }) {
  const [, setLocation] = useLocation();
  setLocation(to);
  return null;
}

function ProtectedRoute({ component: Component }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function PublicRoute({ component: Component }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login">
        <PublicRoute component={LoginPage} />
      </Route>
      <Route path="/signup">
        <PublicRoute component={SignupPage} />
      </Route>
      <Route path="/">
        <ProtectedRoute component={DashboardPage} />
      </Route>
      <Route path="/add">
        <ProtectedRoute component={AddTransactionPage} />
      </Route>
      <Route path="/reports">
        <ProtectedRoute component={ReportsPage} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute component={ProfilePage} />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ExpenseProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ExpenseProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
