import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./info.css";
import useFetchUser from "../hooks/useFetchUser";

const InfoPage = () => {
	const { id } = useParams();
	const { user, error } = useFetchUser(id);
	const navigate = useNavigate();

	if (error) {
		return <div>Error: {error}</div>;
	}

	if (!user) {
		return <div>Loading...</div>;
	}

	const handleButtonClick = () => {
		navigate(`/profile/${id}`);
	};

	return (
		<div className="front-container">
			<h1>Welcome {user.username}</h1>
			<div className="front-content">
				<h2>How to Stay on the Top Active List</h2>
				<ul>
					<li>
						Ensure at least three projects are pinned on your GitHub profile.
					</li>
					<li>
						Your GitHub README should include a link to your LinkedIn profile,
						your CV, and a personal statement.
					</li>
					<li>You must make at least 10 contributions within a month.</li>
					<li>Include your skills in your GitHub profile.</li>
					<li>
						The heatmap is calculated based on the criteria mentioned above. You
						will lose points if you fail to meet any of these requirements.
					</li>
				</ul>
				<button className="front-button" onClick={handleButtonClick}>
					Continue to see your profile
				</button>
				<p>
					All information is imported directly from your GitHub profile. The app
					does not allow for direct input.
				</p>
				<p>
					If you encounter any issues with the app, please contact the
					developers through the contact section.
				</p>
			</div>
		</div>
	);
};

export default InfoPage;
