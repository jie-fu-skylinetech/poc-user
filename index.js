const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const https = require("https");

var user_service_base_url = 
//production url
"https://skyline-user.appspot.com/";
//dev testing url
//"https://8080-dot-3319622-dot-devshell.appspot.com/";

var gcp_tokens;

function authorize_gcp() {
  return new Promise((resolve, reject) => {
    let current_time = new Date().getTime();
    console.log("authorize_gcp");
    console.log("current_time:" + current_time);
    if (gcp_tokens) console.log("gcp_tokens:" + gcp_tokens);
    if (gcp_tokens && gcp_tokens.expiry_date) {
      console.log("gcp_tokens.expiry_date:" + gcp_tokens.expiry_date);
      console.log("gcp_tokens.expiry_date:" + new Date(gcp_tokens.expiry_date));
    }
    if (
      gcp_tokens &&
      gcp_tokens.expiry_date &&
      current_time + 5 * 60 * 1000 < gcp_tokens.expiry_date
    ) {
      console.log("token is valid");
      resolve(gcp_tokens);
    } else {
      var google = require("googleapis");
      var privatekey = require("./skyline-user.json");
      var jwtClient = new google.auth.JWT(
        privatekey.client_email,
        null,
        privatekey.private_key,
        ["https://www.googleapis.com/auth/cloud-platform"]
      );
      jwtClient.authorize(function(err, tokens) {
        if (err) {
          reject(err);
          return;
        }
        gcp_tokens = tokens;
        console.log(tokens);
        resolve(tokens);
      });
    }
  });
}

const app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true
  })
);
//app.use(express.json()); // to support JSON-encoded bodies

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

app.post("/api/isWellKnownUser", (req, res) => {
  console.log(req.body);
  authorize_gcp()
    .then(tokens => {
      console.log("Successfully acquired token!");
      const form = new FormData();
      form.append("selfie", fs.readFileSync(req.body.filepath));
      form.append("random", Math.random());
      form.append("token", tokens.access_token);
      user_service_url = user_service_base_url + "isWellKnownUser";
      console.log(user_service_url);
      axios
        .post(user_service_url, form)
        .then(result => {
          //console.log(result);
          res.json(result.data);
        })
        .catch(error => {
          res.status(500).send(error);
        });
    })
    .catch(err => {
      handle_gcp_error(err);
      return;
    });
});

app.post("/api/registerUnknownUser", (req, res) => {
  console.log(req.body);
  authorize_gcp()
    .then(tokens => {
      console.log("Successfully acquired token!");
      const form = new FormData();
      form.append("selfie", fs.readFileSync(req.body.filepath));
      form.append("random", Math.random());
      form.append("token", tokens.access_token);
      user_service_url = user_service_base_url + "registerUnknownUser";
      console.log(user_service_url);
      axios
        .post(user_service_url, form)
        .then(result => {
          //console.log(result);
          res.json(result.data);
        })
        .catch(error => {
          res.status(500).send(error);
        });
    })
    .catch(err => {
      handle_gcp_error(err);
      return;
    });
});

function handle_gcp_error(err) {
  console.log("gcp authorize error");
  console.log(err);
  res.status(500).send(err.message);
}
// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Express server listening on ${port}`);

/*
  function upload(){
  jwtClient.authorize(function(err, tokens) {
    if (err) {
      console.log("authorize error");
      console.log(err);
      res.status(500).send(err.message);
      return;
    } else {
      console.log("Successfully acquired token!");
      console.log(tokens);
      const form = new FormData();
      form.append("selfie", fs.readFileSync(req.body.filepath));
      form.append("random", Math.random());
      form.append("token", tokens.access_token);
      user_service_url = user_service_base_url + "isWellKnownUser";
      console.log(user_service_url);
      axios
        .post(user_service_url, form)
        .then(result => {
          console.log(result);
          res.json(result.data);
        })
        .catch(error => {
          res.status(500).send(error);
        });
    }
  });

  }
  */
