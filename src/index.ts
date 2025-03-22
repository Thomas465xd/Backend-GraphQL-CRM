import colors from "colors";
import app from "./server"; // Import the Express app, not Apollo server

const port = process.env.PORT || 4000;

app.listen(port, () => {
	console.log(colors.magenta.bold(`🚀 REST API running on port: ${port}`));
});