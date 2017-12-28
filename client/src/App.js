import React from "react";
import "semantic-ui-css/semantic.min.css";
import { Button, Form, Grid, Header, Segment } from "semantic-ui-react";
import axios from "axios";

class App extends React.Component {
  constructor() {
    super();
    // Initialize state
    this.state = {
      filepath: ""
    };
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
  }

  login() {
    //isWellKnownUser
    this.capture().then(filepath => {
      this.setState({ 'filepath': filepath }, () => {
        axios
          .post("/api/isWellKnownUser", {
            filepath: this.state.filepath,
            random: Math.random()
          })
          .then(res => console.log(res.data))
          .catch(err => console.log(err.data));
      });
    });
  }

  register() {
    this.capture().then(filepath => {
      this.setState({ 'filepath': filepath }, () => {
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
