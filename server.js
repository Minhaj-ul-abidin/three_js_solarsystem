const express = require("express");
const app = express();
var cors = require("cors");
const path = require("path");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + '/static'));
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "index.html"));
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running at ${PORT}`));