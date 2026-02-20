import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth, roleLabels } from "../AuthContext";

describe("AuthContext", () => {
  it("provides default unauthenticated state", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("logs in a user", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    
    act(() => {
      result.current.login("provider");
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.name).toBe("Dr. Smith");
    expect(result.current.user?.role).toBe("provider");
  });

  it("logs out a user", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    
    act(() => {
      result.current.login("provider");
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    
    act(() => {
      result.current.logout();
    });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("has role labels for all roles", () => {
    expect(roleLabels.provider).toBe("Provider");
    expect(roleLabels.nurse).toBe("Nurse");
    expect(roleLabels.scheduling_assistant).toBe("Scheduling Assistant");
    expect(roleLabels.pharmacy).toBe("Pharmacy");
    expect(roleLabels.imaging_tech).toBe("Imaging Tech");
    expect(roleLabels.billing).toBe("Billing");
    expect(roleLabels.office_manager).toBe("Office Manager");
  });
});
