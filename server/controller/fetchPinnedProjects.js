import db from "../db";

export default async function fetchPinnedProjects(username) {
	const gitHubGraphqlLink = "https://api.github.com/graphql";
	const headers = {
		Authorization: `Bearer ${process.env.GITHUB_AUTH_KEY}`,
		"Content-Type": "application/json",
	};
	const body = JSON.stringify({
		query: `{
			user(login: "${username}") {
			  pinnedItems(first: 6, types: REPOSITORY) {
				nodes {
				  ... on RepositoryInfo {
					name
					description
					url
					homepageUrl
					
				  }
				}
			  }
			}
		  }`,
	});

	try {
		const response = await fetch(gitHubGraphqlLink, {
			method: "POST",
			headers: headers,
			body: body,
		});

		if (!response.ok) {
			throw new Error(`GitHub API responded with status ${response.status}`);
		}

		const projects_data = await response.json();

		const projects = projects_data.data.user.pinnedItems.nodes;

		try {
			const fetchTime = Math.floor(Date.now() / 1000);
			for (const project of projects) {
				await db.query(
					`WITH user_data AS (
					  SELECT id AS user_id FROM users WHERE github_username = $1
					)
					INSERT INTO projects (name, description, url, preview_url, user_id, fetch_time)
					VALUES ($2, $3, $4, $5, (SELECT user_id FROM user_data), $6);`,
					[
						username,
						project.name,
						project.description,
						project.url,
						project.homepageUrl,
						fetchTime,
					]
				);
			}

			return { message: "successfully added to db" };
		} catch (error) {
			return { error: error, message: "Cannot connect to db" };
		}
	} catch (error) {
		return { error: error, message: "Cannot connect to GitHub API" };
	}
}

// to test this function use this endpoint in api.js file

// router.get("/fetchPinnedProjects", async (_, res) => {
// 	const test = await fetchPinnedProjects("RbAvci")
// 	res.send(test)
// });
