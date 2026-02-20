import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Practice Management</h1>
      <p>Welcome to the Practice Management System</p>
    </div>
  );
}
