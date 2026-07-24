
import { NavLink, Outlet } from "react-router-dom";
import { useTheme } from "../providers/ThemeProvider";


const RootLayout = () => {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <nav
        style={{
          background: "#2563eb",
          color: "#fff",
          padding: "15px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>HMS</h2>

        <button onClick={() => setTheme("dark")}>Dark</button>

        <button onClick={() => setTheme("light")}>Light</button>

        <div style={{ display: "flex", gap: "20px" }}>
          <NavLink to="/" style={{ color: "#fff", textDecoration: "none" }}>
            Home
          </NavLink>

          <NavLink
            to="/products"
            style={{ color: "#fff", textDecoration: "none" }}
          >
            Products
          </NavLink>

          <NavLink
            to="/profile"
            style={{ color: "#fff", textDecoration: "none" }}
          >
            Profile
          </NavLink>

          <NavLink
            to="/login"
            style={{ color: "#fff", textDecoration: "none" }}
          >
            Login
          </NavLink>

          <NavLink
            to="/register"
            style={{ color: "#fff", textDecoration: "none" }}
          >
            Register
          </NavLink>
        </div>
      </nav>

      <main style={{ padding: "30px" }}>
        <Outlet />
      </main>
    </>
  );
};

export default RootLayout;
