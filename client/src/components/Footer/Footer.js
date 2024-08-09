import { Link, Routes, Route } from "react-router-dom";
import "./Footer.css";
import Contact from "./contact/contact";
// import About from "./about/About";

const Footer = () => (
	<footer className="footer">
		<div className="footer-content">
			<nav className="nav">
				<Link to="/about">About Us</Link>
				<a
					href="https://github.com/RbAvci/Read-me-Hire-me"
					target="_blank"
					rel="noopener noreferrer"
				>
					GitHub
				</a>
				<Link to="/contact">Contact Us</Link>
			</nav>
			<div className="copyright">
				&copy; {new Date().getFullYear()} CYF. All rights reserved.
			</div>
		</div>

		<Routes>
			<Route path="/contact" element={<Contact />} />
			<Route path="/about" />
		</Routes>
	</footer>
);

export default Footer;
