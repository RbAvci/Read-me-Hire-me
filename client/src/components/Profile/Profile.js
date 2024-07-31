import React from "react";
import { useParams } from "react-router-dom";
import "./Profile.css";
import Readme from "../Readme/Readme";
import useFetchUser from "../hooks/useFetchUser";
import Project from "../Project/Project";
import Contribution from "../contribution/contribution";

const Profile = () => {
	const { id } = useParams();
	const { user, error } = useFetchUser(id);

	if (error) {
		return <div>Error: {error}</div>;
	}

	if (!user) {
		return <div>Loading...</div>;
	}

	return (
		<div className="profile-container">
			<header>
				<h1>Welcome {user.username}</h1>
				{user.github_username && (
					<p>
						Github:{" "}
						<a
							href={`https://github.com/${user.github_username}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							{user.github_username}
						</a>
					</p>
				)}
			</header>
			<Readme userId={id} />

			<Project userId={id} />
			<Contribution userId={id} />
		</div>
	);
};

export default Profile;
