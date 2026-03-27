jest.mock("expo-router", () => ({
  Link: ({ children }: { children: any }) => children,
  router: {
    replace: jest.fn()
  }
}));

jest.mock("@/services/backend", () => ({
  backend: {
    login: jest.fn().mockResolvedValue({
      accessToken: "token",
      tokenType: "Bearer",
      user: {
        id: "driver-user-1",
        name: "Driver User",
        email: "driver@test.local",
        role: "driver",
        active: true
      }
    })
  }
}));

import { fireEvent, render, waitFor } from "@testing-library/react-native";

import LoginScreen from "@/app/(auth)/login";
import { backend } from "@/services/backend";

describe("LoginScreen", () => {
  it("submits credentials to the backend adapter", async () => {
    const screen = render(<LoginScreen />);

    fireEvent.press(screen.getByText("Sign in"));

    await waitFor(() => {
      expect(backend.login).toHaveBeenCalled();
    });
  });
});
