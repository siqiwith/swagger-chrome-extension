import React, { Component } from 'react';

import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { Paper, TextField } from '@material-ui/core';
import 'whatwg-fetch';

import styles from './styles';

export interface AppProps
  extends WithStyles<typeof styles> {
};

const yamlServer = 'http://localhost:3000';
const swaggerServer = 'http://localhost';

class App extends Component<AppProps> {
  state = {
    swaggerServer: '',
    yamlServer: ''
  };
  public render() {
    const { classes } = this.props;
    return (
      <CssBaseline>
        <div className={classes.app}>
          {this.renderContent()}
        </div>
      </CssBaseline>
    );
  }

  renderContent() {
    const { classes } = this.props;
    const result = (
      <div>
        <Paper className={classes.container}>
          <TextField
            id="swaggerServer"
            label="Swagger Server Address"
            style={{ margin: 8 }}
            placeholder=""
            helperText="e.g. http://localhost"
            fullWidth
            margin="normal"
            value={this.state.swaggerServer}
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(event) => {
              this.setState({
                swaggerServer: event.target.value
              });
            }}
            onBlur={this.saveOptions}
          />
          <TextField
            id="yamlServer"
            label="YAML Server Address"
            style={{ margin: 8 }}
            placeholder=""
            helperText="e.g. http://localhost:3000"
            fullWidth
            margin="normal"
            value={this.state.yamlServer}
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(event) => {
              this.setState({
                yamlServer: event.target.value
              });
            }}
          />
        </Paper>
      </div>
    )
    return result;
  }

  async componentDidMount() {
    const options: any = await this.readOptions();
    this.setState({
      swaggerServer: options.swaggerServer || '',
      yamlServer: options.yamlServer || '',
    });
  }

  async readOptions() {
    return new Promise((resolve, reject) => {
      if (chrome && chrome.permissions) {
        chrome.storage.sync.get(['swaggerServer', 'yamlServer'], (result) => {
          resolve(result);
        })
      } else {
        resolve({})
      }
    });
  }

  saveOptions = () => {
    console.log(this.state.swaggerServer);
    if (chrome && chrome.permissions) {
      chrome.storage.sync.set({
        swaggerServer: this.state.swaggerServer,
        yamlServer: this.state.yamlServer
      }, () => {
      })
    }
  }


}

export default withStyles(styles)(App);
