import React from "react";
import "semantic-ui-css/semantic.min.css";
import { Button, Form, Grid, Header, Segment } from "semantic-ui-react";
import axios from "axios";
const FormData = require("form-data");
const baseUrl = "https://skyline-user.appspot.com/";

class App extends React.Component {
  constructor() {
    super();
    // Initialize state
    this.state = {
      filepath: "",
      gcp_tokens: null
    };
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
  }

  authorize_gcp() {
    return new Promise((resolve, reject) => {
      let current_time = new Date().getTime();
      console.log("authorize_gcp");
      console.log("current_time:" + current_time);
      if (this.state.gcp_tokens)
        console.log("gcp_tokens:" + this.state.gcp_tokens);
      if (this.state.gcp_tokens && this.state.gcp_tokens.expiry_date) {
        console.log(
          "gcp_tokens.expiry_date:" + this.state.gcp_tokens.expiry_date
        );
        console.log(
          "gcp_tokens.expiry_date:" +
            new Date(this.state.gcp_tokens.expiry_date)
        );
      }
      // Renew token 5 mins to expiry
      if (
        this.state.gcp_tokens &&
        this.state.gcp_tokens.expiry_date &&
        current_time + 5 * 60 * 1000 < this.state.gcp_tokens.expiry_date
      ) {
        console.log("token is valid");
        resolve(this.state.gcp_tokens);
      } else {
        var google = require("googleapis");

        var privatekey = require("./skyline-user.json");
        var jwtClient = new google.auth.JWT(
          privatekey.client_email,
          null,
          privatekey.private_key,
          ["https://www.googleapis.com/auth/cloud-platform"]
        );
        console.log("authorize")
        jwtClient.authorize(function(err, tokens) {
          if (err) {
            console.log(err)
            reject(err);
            return;
          }
          this.setState({"gcp_tokens": tokens}, () => {
            console.log(tokens);
            resolve(tokens);
          });
        });
      }
    });
  }

  toDataURI(filepath) {
    // let reader = new FileReader();
    // reader.onload = e => {};
    // reader.readAsDataURL(filepath);
    return "";
  }

  dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(",")[0].indexOf("base64") >= 0)
      byteString = atob(dataURI.split(",")[1]);
    else byteString = unescape(dataURI.split(",")[1]);

    // separate out the mime component
    var mimeString = dataURI
      .split(",")[0]
      .split(":")[1]
      .split(";")[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
  }

  login() {
    //isWellKnownUser
    this.capture()
      .then(filepath => {
        this.setState({"filepath": filepath});
      })
      .then(filepath => {
        this.authorize_gcp().then(tokens => {
          const form = new FormData();
          form.append("token", tokens.access_token);
          form.append("random", Math.random());
          form.append(
            "imageData",
            this.dataURItoBlob(this.toDataURI(filepath))
          );
          axios
            .post(baseUrl + "isWellKnownUser", form, {
              headers: { "Content-Type": "multipart/form-data" }
            })
            .then(res => console.log(res.data))
            .catch(err => console.log(err.data));
        });
      });
  }

  register() {
    this.capture().then(filepath => {
      this.setState({ filepath: filepath }, () => {
        axios
          .post("/api/registerUnknownUser", {
            filepath: this.state.filepath,
            random: Math.random()
          })
          .then(res => console.log(res.data))
          .catch(err => console.log(err.data));
      });
    });
  }

  capture() {
    return new Promise((resolve, reject) => {
      //Capture picture with phone and get the file path of the image
      let filepath = "./client/public/images/Google.jpg";
      resolve(filepath);
    });
  }

  render() {
    return (
      <div className="login-form">
        <style>{`
      body > div,
      body > div > div,
      body > div > div > div.login-form {
        height: 100%;
      }
    `}</style>
        <Grid
          textAlign="center"
          style={{ height: "100%" }}
          verticalAlign="middle"
        >
          <Grid.Column style={{ maxWidth: "60%" }}>
            <Header as="h2" color="teal" textAlign="center">
              Log-in to your account
            </Header>
            <Form size="large">
              <Segment stacked>
                <p>
                  <Button onClick={this.login} color="teal" fluid size="large">
                    Login
                  </Button>
                </p>
                <p>
                  <Button
                    onClick={this.register}
                    color="teal"
                    fluid
                    size="large"
                  >
                    Register
                  </Button>
                </p>
              </Segment>
            </Form>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}
export default App;
