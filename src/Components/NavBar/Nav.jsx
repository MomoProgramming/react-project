import { Link, NavLink } from "react-router";
import "./Nav.css";

const navigationLinks = [
  { to: "/", label: "Home" },
  { to: "/gallery", label: "Gallery" },
  { to: "/commissions", label: "Commissions" },
  { to: "/commission-request", label: "Request a Commission" },
  { to: "/about", label: "About" },
  { to: "/artist", label: "Artist Dashboard" },
];

export default function Nav() {
  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Main navigation">
        <Link to="/" className="site-brand">
          Lumi's Art Portal
        </Link>

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
      </nav>
    </header>
  );
}