import React from "react";
import { useParams } from "react-router-dom";
import "./Profile.css";
import Readme from "../Readme/Readme";
import useFetchUser from "../hooks/useFetchUser";
import Project from "../Project/Project";
import Contribution from "../Contribution/Contribution.js";
import Avatar from "../Skills/Avatar";




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
			<Avatar userId={id} user={user} className="item1" />
			<Readme userId={id} user={user} className="item2" />
			<Project userId={id} className="item3" />
			<Contribution userId={id} className="item4" />
		</div>
	);
};

export default Profile;
