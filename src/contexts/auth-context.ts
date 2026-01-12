import { createContext } from "react";
import type { AuthContextType } from "./AuthContext";

// Kept in a separate module to avoid React Fast Refresh creating a new context
// instance and breaking Provider/consumer matching.
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
