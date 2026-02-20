# Authentication (Fake)

## Overview

Fake authentication system for development. Ready for Clerk integration in later phase.

## Features

- Auth context with React Context API
- Login/logout for 7 roles
- Mock users for each role
- Role labels for UI display

## Roles

- Provider
- Nurse
- Scheduling Assistant
- Pharmacy
- Imaging Tech
- Billing
- Office Manager

## Usage

```tsx
import { AuthProvider, useAuth, roleLabels } from "./auth/AuthContext";

function App() {
  return (
    <AuthProvider>
      <MyApp />
    </AuthProvider>
  );
}

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  // ...
}
```
