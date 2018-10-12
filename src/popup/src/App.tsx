import React, { Component } from 'react';

import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import Select from 'react-select';
import 'whatwg-fetch';

import styles from './styles';

export interface AppProps
  extends WithStyles<typeof styles> {
};


async function readOptions() {
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

enum MODE {
  SELECT_YAML = 'SELECT_YAML',
  OPEN_SWAGGER = 'OPEN_SWAGGER'
};

const DEFAULT_SWAGGER_SERVER = 'http://localhost';
const DEFAULT_YAML_SERVER = 'http://localhost:3000';

class App extends Component<AppProps> {
  swaggerServer = DEFAULT_SWAGGER_SERVER;
  yamlServer = DEFAULT_YAML_SERVER;

  state = {
    selectedItem: null,
    options: [],
    mode: MODE.OPEN_SWAGGER
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
    let result;
    if (this.state.mode === MODE.OPEN_SWAGGER) {
      result = (
        <div>
          <Button variant="contained" color="primary" className={classes.openSwaggerButton}
            onClick={this.openSwagger}
          >
          Open Swagger UI
          </Button>
        </div>
      );
    } else {
      result = (
        <div>
          <Select
            className={classes.yamlSelector}
            options={this.state.options}
            value={this.state.selectedItem}
            onChange={this.handleChange}
            isSearchable={true}
            placeholder="Search a .yaml file"
          />
        </div>
      )
    }
    return result;
  }

  async componentDidMount() {
    const options: any = await readOptions();
    this.swaggerServer = options.swaggerServer || DEFAULT_SWAGGER_SERVER;
    this.yamlServer = options.yamlServer ||  DEFAULT_YAML_SERVER;

    this.populateYamlOptions();

    if (chrome) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url as string;
        const reg = new RegExp(`^${this.swaggerServer}`);
        const mode = reg.test(url) ? MODE.SELECT_YAML : MODE.OPEN_SWAGGER;
        this.setState({
          mode
        })
      });
    }
  }

  populateYamlOptions = async () => {
    const options = await this.getYamlOptions();
    this.setState({
      options
    })
  }

  getYamlServerIndexContent = async () => {
    return fetch(this.yamlServer).then((response) => {
      return response.text();
    })
  }

  getYamlOptions = async () => {
    const result: any[] = [];
    const content = await this.getYamlServerIndexContent();
    const reg = /href="([^\.<>]+\.yaml)"/g;
    let matched: RegExpExecArray | null = null;
    do {
      matched = reg.exec(content);
      if (matched) {
        result.push({
          label: matched[1],
          value: matched[1]
        })
      }
    } while (matched)
    return result;
  }

  handleChange = (selectedOption) => {
    console.log(selectedOption);
    this.setState({
      selectedItem: selectedOption
    });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const code = `
      var inputElem = document.body.querySelector('.download-url-input');
      var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      nativeInputValueSetter.call(inputElem, "${this.yamlServer}/${selectedOption.value}");

      var event = new Event('input', { bubbles: true});
      inputElem.dispatchEvent(event);
      document.body.querySelector('.download-url-button').click();
      `;
      console.log(code);
      chrome.tabs.executeScript(
        tabs[0].id as number,
        {
          code
        }, (result) => {
          console.log(result);
        });
    });
  }

  openSwagger = () => {
    const target = this.swaggerServer;
    window.open(target, '_blank')
  }
}

export default withStyles(styles)(App);
