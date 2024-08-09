import React from "react";
import "./about.css";
const About = () => {
	return (
		<div className="container">
			<h1>Read me, Hire me!</h1>
			<p>
				The project aims to automate the creation of a graduate directory by
				harvesting the activity of Code Your Future (CYF) graduates. This system
				will utilize data from graduates' GitHub profiles to update and maintain
				an up-to-date directory, showcasing their skills and projects. This
				initiative ensures that potential employers and collaborators have easy
				access to relevant and current information about CYF graduates,
				facilitating better opportunities and networking within the tech
				community.
			</p>

			<h2>Purpose:</h2>
			<p>
				To create a graduate platform that highlights contributions, projects,
				and skills using GitHub API integrations.
			</p>

			<h2>Key Features:</h2>
			<ul>
				<li>
					<strong>GitHub Data Fetching:</strong> Fetch contributions, projects,
					and skills; extract resumes, and LinkedIn profiles from GitHub Profile
					README; to showcase projects and portfolios. Give an Activity Score to
					the users!
				</li>
				<li>
					<strong>User Management:</strong> Allow grads to add or remove their
					GitHub account while they are signing up.
				</li>
				<li>
					<strong>Visualisations:</strong> Create graphs to display activity and
					show each grad's profile nicely.
				</li>
				<li>
					<strong>Search and Browse:</strong> Add search and sorting to find
					active grads and those available for work.
				</li>
			</ul>

			<h2>User Roles:</h2>
			<ul>
				<li>
					<strong>Graduates:</strong> Focus on coding and let their work shine
					automatically.
				</li>
				<li>
					<strong>Mentors:</strong> Quickly see who's active and who needs help.
				</li>
				<li>
					<strong>Recruiters:</strong> Easily search and filter grads to find
					the perfect fit.
				</li>
			</ul>

			<h2>How You Can Help:</h2>
			<p>
				We know there are still some bugs and missing features, and the project
				isn't finished yet, but we would love to get your feedback at this
				stage. Are we covering all the important features? Is the user flow easy
				to understand for everyone (grads, mentors, recruiters)?
			</p>
		</div>
	);
};

export default About;
