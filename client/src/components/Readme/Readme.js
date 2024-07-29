import React, { useEffect, useState } from "react";
import "./readme.css";

const Readme = ({ userId }) => {
	const [readme, setReadme] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchReadme = async () => {
			const token = localStorage.getItem("token");
			try {
				const response = await fetch(`/api/info/${userId}/readme`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				if (!response.ok) {
					throw new Error("README not found");
				}
				const result = await response.json();
				setReadme(result.readme);
			} catch (error) {
				setError(error.message);
			}
		};

		fetchReadme();
	}, [userId]);

	if (error) {
		return <div className="readme-container">Error: {error}</div>;
	}

	if (!readme) {
		return <div className="readme-container">Loading...</div>;
	}

	const extractAndFilterLinks = (content) => {
		const linkPatterns = {
			cv: /\[cv\]\((https?:\/\/[^\s)]+)\)/i,
			linkedin: /\[linkedin\]\((https?:\/\/[^\s)]+)\)/i,
			personalStatement: /\[personal-statement\]\((https?:\/\/[^\s)]+)\)/i,
		};

		const allowedLinks = {};
		let cleanedContent = content;

		Object.keys(linkPatterns).forEach((key) => {
			const match = content.match(linkPatterns[key]);
			allowedLinks[key] = match ? { text: key, url: match[1] } : null;
			cleanedContent = cleanedContent.replace(linkPatterns[key], "");
		});

		cleanedContent = cleanedContent
			.replace(/https?:\/\/[^\s)]+/gi, "")
			.replace(/\[.*?\]\((https?:\/\/[^\s)]+)\)/gi, "")
			.replace(/(?:^|\s)[-•]\s.*(?=\n|\r|$)/g, "")
			.replace(/\s\s+/g, " ")
			.trim();

		return { allowedLinks, cleanedContent };
	};

	const { allowedLinks, cleanedContent } = extractAndFilterLinks(readme);

	return (
		<div className="readme-container">
			<h2>README</h2>
			<p>{cleanedContent}</p>
			<nav className="navig">
				{allowedLinks.cv && (
					<a
						href={allowedLinks.cv.url}
						target="_blank"
						rel="noopener noreferrer"
					>
						{allowedLinks.cv.text}
					</a>
				)}
				{allowedLinks.linkedin && (
					<a
						href={allowedLinks.linkedin.url}
						target="_blank"
						rel="noopener noreferrer"
					>
						{allowedLinks.linkedin.text}
					</a>
				)}
				{allowedLinks.personalStatement && (
					<a
						href={allowedLinks.personalStatement.url}
						target="_blank"
						rel="noopener noreferrer"
					>
						{allowedLinks.personalStatement.text}
					</a>
				)}
			</nav>
		</div>
	);
};

export default Readme;
