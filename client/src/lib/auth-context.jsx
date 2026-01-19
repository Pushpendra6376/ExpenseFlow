import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("expense_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("expense_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("expense_user");
    }
  }, [user]);

  const login = async (email, _password) => {
    await new Promise((r) => setTimeout(r, 500));

    setUser({
      id: 1,
      username: email.split("@")[0],
      email,
      currency: "$",
    });

    return true;
  };

  const signup = async (username, email, _password) => {
    await new Promise((r) => setTimeout(r, 500));

    setUser({
      id: 1,
      username,
      email,
      currency: "$",
    });

    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("expense_user");
  };

  const updateCurrency = (currency) => {
    if (user) {
      setUser({ ...user, currency });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateCurrency,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
