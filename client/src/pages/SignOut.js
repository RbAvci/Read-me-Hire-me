import { useNavigate } from "react-router-dom";
import "./SignOut.css";

const SignOut = ({ setSignedIn }) => {
	const navigate = useNavigate();

	const handleSignOut = () => {
		localStorage.removeItem("token");
		setSignedIn(false);
		navigate("/signIn");
	};

	const handleNo = () => {
		navigate(-1);
	};

	return (
		<div className="signOut">
			<h1>Are you sure you want to sign out?</h1>
			<div className="signOutButtons">
				<button
					className="yesButton"
					onClick={handleSignOut}
					aria-label="Confirm sign out"
				>
					Yes
				</button>
				<button
					className="noButton"
					onClick={handleNo}
					aria-label="Cancel sign out"
				>
					No
				</button>
			</div>
		</div>
	);
};

export default SignOut;
