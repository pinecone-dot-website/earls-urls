import app from "./app";

app.listen(process.env.PORT, function () {
  console.log("Listening on port " + process.env.PORT);
});