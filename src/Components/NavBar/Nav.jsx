import { Link, NavLink } from "react-router-dom";
import "./Nav.css";

const navigationLinks = [
  { to: "/", label: "Home" },
  { to: "/gallery", label: "Gallery" },
  { to: "/commissions", label: "Services" },
  { to: "/about", label: "About" },
];

export default function Nav() {
  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Main navigation">
        <Link to="/" className="site-brand">
          Luminium
        </Link>

        <div className="nav-right">
          <ul className="nav-links">
            {navigationLinks.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    `nav-link${isActive ? " is-active" : ""}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <Link to="/commission-request" className="nav-cta">
            Commission
          </Link>
        </div>
      </nav>
    </header>
  );
}