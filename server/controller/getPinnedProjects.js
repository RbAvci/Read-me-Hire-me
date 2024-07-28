import db from "../db";

// export default async function getPinnedProjects(req, res, next) {
// 	const user_id = req.params.id;
// 	console.log(user_id);
// 	try {
// 		const user_id_check = await db.query(
// 			`SELECT COUNT(*) as count FROM projects WHERE user_id = $1`,
// 			[user_id]
// 		);

// 		if (user_id_check.rows[0].count == 0) {
// 			return res.status(404).json({ error: "User not found" });
// 		}

// 		try {
// 			const projects_data = await db.query(
// 				`SELECT * FROM projects WHERE user_id = $1`,
// 				[user_id]
// 			);

// 			res.status(200).json({ projects: projects_data.rows });
// 		} catch (error) {
// 			res.status(500).json({ error: "Database connection error" });
// 		}
// 	} catch (error) {
// 		res.status(500).json({ error: "Internal server error" });
// 	}
// }
export default async function getPinnedProjects(username) {
	try {
		// Query the database for pinned projects associated with the given username
		const result = await db.query(
			`SELECT p.name, p.description, p.url, p.preview_url
			FROM projects p
			JOIN users u ON u.id = p.user_id
			WHERE u.github_username = $1`,
			[username]
		);

		if (result.rows.length === 0) {
			return {
				success: false,
				message: "No pinned projects found for this user",
			};
		}
		const projects = result.rows;

		return { success: true, data: projects };
	} catch (error) {
		console.error("Database query error:", error);
		return {
			success: false,
			error: "Failed to retrieve pinned projects from the database",
		};
	}
}
