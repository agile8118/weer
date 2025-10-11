import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

interface AuthContextValue {
  loading: boolean;
  isSignedIn: boolean | null;
  email: string;
  username: string;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  const refreshAuth = useCallback(async () => {
    setLoading(true);
    const { data } = await axios.get("/auth/status");
    setIsSignedIn(data.isSignedIn);
    setEmail(data.email);
    setUsername(data.username);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  return (
    <AuthContext.Provider
      value={{ isSignedIn, email, username, refreshAuth, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
