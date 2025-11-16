// src/lib/auth.ts
// Fake authentication system for development

export interface User {
  username: string;
  name: string;
  email: string;
}

interface Credentials {
  password: string;
  name: string;
  email: string;
}

// Fake user database
const FAKE_USERS: Record<string, Credentials> = {
  admin: {
    password: "admin123",
    name: "Admin User",
    email: "admin@example.com",
  },
  demo: {
    password: "demo123",
    name: "Demo User",
    email: "demo@example.com",
  },
  user: {
    password: "user123",
    name: "Test User",
    email: "user@example.com",
  },
};

export const login = (username: string, password: string): User | null => {
  const user = FAKE_USERS[username];

  if (user && user.password === password) {
    const userData: User = {
      username,
      name: user.name,
      email: user.email,
    };

    // Store in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("isAuthenticated", "true");
    }

    return userData;
  }

  return null;
};

export const logout = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
  }
};

export const getCurrentUser = (): User | null => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("isAuthenticated") === "true";
  }
  return false;
};
