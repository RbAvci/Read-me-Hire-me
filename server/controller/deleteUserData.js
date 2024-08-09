import db from "../db";

export default async function deleteUserData(userId) {
	try {
		const userResponse = await db.query(
			`SELECT * FROM users WHERE id = $1`,
			[userId]
		);

		if (userResponse.rows.length === 0) {
			return { success: false, message: "User not found" };
		}

		try {
			await db.query("BEGIN");
			await db.query(`DELETE FROM activities WHERE user_id = $1`, [userId]);
			await db.query(`DELETE FROM profiles WHERE user_id = $1`, [userId]);
			await db.query(`DELETE FROM projects WHERE user_id = $1`, [userId]);
			await db.query(`DELETE FROM pull_requests WHERE user_id = $1`, [userId]);
			await db.query(`DELETE FROM readmes WHERE user_id = $1`, [userId]);
			await db.query("COMMIT");

			return {
				success: true,
				message: "Related data successfully deleted from the database",
			};
		} catch (error) {
			await db.query("ROLLBACK");
			throw new Error(
				"Failed to delete related data from the database: " + error.message
			);
		}
	} catch (error) {
		throw new Error("Database connection error: " + error.message);
	}
}