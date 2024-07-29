import React, { useState } from "react";
import "./FormStyles.css";
import { useNavigate } from "react-router-dom";
import { hashPassword } from "./Util.js";

const authenticateUser = async (username, passwordHash) => {
	try {
		const response = await fetch("/api/sign-in", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ username, passwordHash }),
		});

		if (response.ok) {
			const result = await response.json();
			return { success: true, data: result.data };
		} else {
			const errorResult = await response.json();
			return {
				success: false,
				message: errorResult.message || "Authentication failed",
			};
		}
	} catch (error) {
		return { success: false, message: "Network error" };
	}
};

const SignIn = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const navigate = useNavigate();
	const handleSignIn = async (event) => {
		event.preventDefault();
		const passwordHash = await hashPassword(password);

		const result = await authenticateUser(username, passwordHash);

		if (result.success) {
			localStorage.setItem("token", result.data.user.token);
			navigate(`/info/${result.data.id}`);
		} else {
			setMessage(`Error: ${result.message}`);
		}
	};

	return (
		<div className="signInCard">
			<h1>Sign In</h1>
			<form onSubmit={handleSignIn}>
				<label htmlFor="username">Username:</label>
				<input
					type="text"
					id="username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					required
				/>
				<br />
				<br />

				<label htmlFor="password">Password:</label>
				<input
					type="password"
					id="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
				<br />
				<br />

				<button type="submit">Sign In</button>
			</form>
			{message && <div className="message">{message}</div>}
		</div>
	);
};

export default SignIn;
