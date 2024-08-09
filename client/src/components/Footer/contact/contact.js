import React from "react";
import Swal from "sweetalert2";
import "./contact.css";

const Contact = () => {
	const onSubmit = async (event) => {
		event.preventDefault();
		const { target } = event;
		const formData = new FormData(target);
		formData.append("access_key", "2f342322-95fc-4a6e-ad18-32e3349f438e");

		const object = Object.fromEntries(formData);
		const json = JSON.stringify(object);

		try {
			const res = await fetch("https://api.web3forms.com/submit", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: json,
			});

			const result = await res.json();

			if (result.success) {
				Swal.fire({
					title: "Success",
					text: "Message sent successfully",
					icon: "success",
				});
				target.reset();
			} else {
				throw new Error(result.message || "Unknown error");
			}
		} catch (error) {
			console.error("Error", error);
			Swal.fire({
				title: "Error",
				text: "Failed to send message. Please try again later.",
				icon: "error",
			});
		}
	};

	return (
		<div className="container">
			<h1>Contact Us</h1>
			<form onSubmit={onSubmit}>
				<label htmlFor="fname">First Name</label>
				<input
					type="text"
					id="fname"
					name="firstname"
					placeholder="Your name.."
					required
				/>

				<label htmlFor="lname">Last Name</label>
				<input
					type="text"
					id="lname"
					name="lastname"
					placeholder="Your last name.."
					required
				/>

				<label htmlFor="email">Email</label>
				<input
					type="email"
					id="email"
					name="email"
					placeholder="Your email.."
					required
				/>

				<label htmlFor="subject">Message</label>
				<textarea
					id="subject"
					name="subject"
					placeholder="Write something.."
					style={{ height: "200px" }}
					required
				></textarea>

				<input type="submit" value="Submit" />
			</form>
		</div>
	);
};

export default Contact;
