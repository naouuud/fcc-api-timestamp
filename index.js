// index.js
// where your node app starts

// init project
var express = require("express");
var app = express();
const { param, oneOf, validationResult } = require("express-validator");

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.get("/api", (req, res, next) => {
  const date = Date.now();
  const unix = date;
  const utc = new Date(Date.now()).toUTCString();
  res.json({ unix, utc });
});

app.get(
  "/api/:date",
  oneOf([param("date").isISO8601(), param("date").matches(/^-?\d+$/)]),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const err = new Error("Invalid Date");
      next(err);
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(req.params.date)) {
      const date = new Date(req.params.date);
      const unix = Date.parse(date);
      const utc = date.toUTCString();
      res.json({ unix, utc });
    } else {
      const timestamp = parseInt(req.params.date);
      if (timestamp > 8.64e15 || timestamp < -8.64e15) {
        const err = new Error("Invalid Date");
        next(err);
      } else {
        const date = new Date(timestamp);
        const unix = Date.parse(date);
        const utc = date.toUTCString();
        res.json({ unix, utc });
      }
    }
  }
);

app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  if (err.status) {
    res.json({ error: { status: err.status, message: err.message } });
  } else {
    res.json({ error: err.message });
  }
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
