import { Router } from "express";
import getReadme from "../controller/getReadme";
import getActivity from "../controller/getActivity";
import getPinnedProjects from "../controller/getPinnedProjects";

const router = Router();

router.get("/:id/readme", getReadme);
router.get("/:id/activity", getActivity);
// router.get("/:id/projects", getProjects)
router.get("/getPinnedProjects/:username", async (req, res) => {
	const username = req.params.username;
	const result = await getPinnedProjects(username);

	if (result.success) {
		res.status(200).json(result.data);
	} else {
		res.status(500).json({ message: result.message });
	}
});
export default router;
