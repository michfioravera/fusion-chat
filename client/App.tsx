import "./global.css";
import { createRoot } from "react-dom/client";

const TestApp = () => {
  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "#111827", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>Hello React! 🎉</h1>
        <p style={{ fontSize: "1.125rem", color: "#9ca3af" }}>React is working correctly</p>
      </div>
    </div>
  );
};

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<TestApp />);
  console.log("React app mounted successfully");
} else {
  console.error("Root element not found");
}
