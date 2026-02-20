import { createContext, useContext, useState, type ReactNode } from "react";

export type UserRole = 
  | "provider" 
  | "nurse" 
  | "scheduling_assistant" 
  | "pharmacy" 
  | "imaging_tech" 
  | "billing" 
  | "office_manager";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const mockUsers: Record<UserRole, User> = {
  provider: { id: "1", name: "Dr. Smith", email: "dr.smith@clinic.com", role: "provider" },
  nurse: { id: "2", name: "Nurse Johnson", email: "nurse.j@clinic.com", role: "nurse" },
  scheduling_assistant: { id: "3", name: "Sarah Wilson", email: "sarah.w@clinic.com", role: "scheduling_assistant" },
  pharmacy: { id: "4", name: "Pharm. Brown", email: "pharm.b@clinic.com", role: "pharmacy" },
  imaging_tech: { id: "5", name: "Tech Davis", email: "tech.d@clinic.com", role: "imaging_tech" },
  billing: { id: "6", name: "Bill Manager", email: "bill.m@clinic.com", role: "billing" },
  office_manager: { id: "7", name: "Office Chief", email: "office.c@clinic.com", role: "office_manager" },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => {
    setUser(mockUsers[role]);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const roleLabels: Record<UserRole, string> = {
  provider: "Provider",
  nurse: "Nurse",
  scheduling_assistant: "Scheduling Assistant",
  pharmacy: "Pharmacy",
  imaging_tech: "Imaging Tech",
  billing: "Billing",
  office_manager: "Office Manager",
};
