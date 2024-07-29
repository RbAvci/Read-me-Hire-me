import { useState, useEffect } from "react";

const useFetchUser = (id) => {
	const [user, setUser] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchUser = async () => {
			const token = localStorage.getItem("token");
			try {
				const response = await fetch(`/api/users/${id}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				if (!response.ok) {
					throw new Error("User not found");
				}
				const result = await response.json();
				setUser(result.data);
			} catch (error) {
				setError(error.message);
			}
		};

		fetchUser();
	}, [id]);

	return { user, error };
};

export default useFetchUser;
