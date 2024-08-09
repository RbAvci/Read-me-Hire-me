import db from "../db";
import fetchActivity from "../controller/fetchActivity";
import fetchReadme from "../controller/fetchReadme";
import FetchSkills from "../controller/fetchSkills";
import fetchPinnedProjects from "../controller/fetchPinnedProjects";
import cron from "node-cron";
import deleteUserData from "../controller/deleteUserData";
import fetchPullRequests from "../controller/fetchPullRequests";

export function startCron() {
	cron.schedule("0 0 * * *", () => {
		updateAllGradData();
		console.log("Cron job scheduled to run every 24 hours");
	});
}

async function updateAllGradData() {
	try {
		const result = await db.query(
			"SELECT id, github_username FROM users WHERE user_type = 'graduate'"
		);
		for (const user of result.rows) {
			const { id: userId, github_username: userGithub } = user;
			if (userId) {
				deleteUserData(userId);
			}
			if (userGithub) {
				await fetchReadme(userGithub);
				await fetchActivity(userGithub);
				await FetchSkills(userGithub);
				await fetchPinnedProjects(userGithub);
				await fetchPullRequests(userGithub);
			}
		}
	} catch (error) {
		console.error("Failed to fetch user or data from the database");
	}
}
