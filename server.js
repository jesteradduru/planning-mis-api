const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors")
const submitForm = require("./controllers/submitForm")
const files = require("./controllers/files")
const user = require("./controllers/user")
const report = require("./controllers/report")
const multer = require("multer")
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
  }
})

app.use(cors());

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json("it is working");
});

app.post("/signin", (req, res) => {
  user.handleSignIn(req, res);
});

app.post("/submitForm", upload.single("excel"), (req, res) => {
  submitForm.handleSubmitForm(req, res);
}); 

app.get("/generateReport/:corn/:livestock", upload.single("excel"), (req, res) => {
  report.handleGenerateReport(req, res);
}); 

app.get("/listFile/:user",  (req, res) => {
  files.handleListFile(req, res);
}); 

app.listen(3001, console.log("listening to port 3001"))