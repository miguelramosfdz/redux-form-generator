import React from 'react';
import _clone from 'lodash/clone';
import _has from 'lodash/has';
import _map from 'lodash/map';
import _get from 'lodash/get';
import _filter from 'lodash/filter';
import Button from 'react-bootstrap/lib/Button';
import Col from 'react-bootstrap/lib/Col';
import Table from 'react-bootstrap/lib/Table';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import Plupload from 'react-plupload';

class WrapPlupload extends React.Component {

  constructor() {
    super();
    this.state = {
      allFiles: [],
      changed: null
    };
    this.input = {};
    this.custom = {};
    this.renderField = this.renderField.bind(this);
  }

  renderField(props) {
    const {input, label, help, meta: {touched, error, valid}, ...custom} = props;
    this.input = input;
    this.custom = custom;
    const size = _get(this.props.field, 'bsSize', this.props.size);

    const stateChange = (plupload) => {
      if (plupload.state === 2) { // Starting with uploading
        this.setState({pending: true});
        return true;
      }

      this.setState({pending: false});
    };

    const addedFiles = (plupload, files) => {
      const fileList = [];
      _map(files, (file)=> {
        fileList.push(file.name);
      });
    };

    const fileUploaded = (plupload, file, response) => {
      const uploadResponse = JSON.parse(response.response);
      if (_get(custom, 'multi_selection', true) === false) {
        this.setState({allFiles: [uploadResponse.result], changed: Date.now()}, () => {
          this.input.onChange(this.state.allFiles);
        });
      } else {
        const files = _clone(this.state.allFiles);
        files.push(uploadResponse.result);
        this.setState({allFiles: files, changed: Date.now()}, () => {
          this.input.onBlur();
          this.input.onChange(this.state.allFiles);
        });
      }
    };

    const fileDelete = (index) => {
      const files = _clone(this.state.allFiles);
      files[index].deleted = 1;
      this.setState({allFiles: files, changed: Date.now()}, () => {
        this.input.onBlur();
        this.input.onChange(this.state.allFiles);
      });
    };

    const staticForm = _get(this.props, 'static', false);

    const delCol = (key) => {
      if (staticForm === false) {
        return (
          <td>
            <Button onClick={() => { fileDelete(key); }}><i className="fa fa-trash-o"></i></Button>
          </td>
        );
      }
    };

    const renderTable = () => {
      const files = _filter(input.value, file => { return !file.deleted; });
      if (files.length > 0) {
        return (
          <Table striped bordered condensed hover>
            <thead>
            <tr>
              <th>Bestand</th>
              {staticForm === false ? <th></th> : ''}
            </tr>
            </thead>
            <tbody>
            {_map(input.value, (file, key) => {
              if (!file.deleted) {
                return (
                  <tr key={key}>
                    <td>{file.file_original_name} {file.deleted}</td>
                    {delCol(key)}
                  </tr>
                );
              }
            })}
            </tbody>
          </Table>
        );
      }
    };

    const thisSize = () => {
      if (size !== 'medium') {
        return ({bsSize: size});
      }
    };

    const labelSize = () => {
      if (_has(this.props.field, 'labelSize')) {
        return this.props.field.labelSize;
      }
      return {sm: 2};
    };

    const fieldSize = () => {
      if (_has(this.props.field, 'fieldSize')) {
        return this.props.field.fieldSize;
      }
      return {sm: 10};
    };

    const component = () => {
      const staticField = this.props.static || _get(this.props.field, 'static', false);
      if (staticField === false) {
        return (<div>
          <Plupload
            key={input.name}
            {...custom.conf}
            id={`plupload_${input.name}`}
            onFilesAdded={addedFiles}
            onStateChanged={stateChange}
            onFileUploaded={fileUploaded}
          />

        </div>);
      }
    };

    const validationState = () => {
      if (touched && error) {
        return 'error';
      }

      if (touched && valid) {
        return 'success';
      }
    };

    return (
      <FormGroup
        {...thisSize()}
        validationState={validationState()}
      >
        <Col componentClass={ControlLabel} {...labelSize()}>
          {label}
        </Col>
        <Col {...fieldSize()}>
          {component()}
          {renderTable()}
          {touched && error && <FormControl.Feedback />}
          {help && (!touched || !error) && <HelpBlock>{help}</HelpBlock>}
          {touched && error && <HelpBlock>{error}</HelpBlock>}
        </Col>
      </FormGroup>
    );
  }

  render() {
    return null;
  }
}

WrapPlupload.propTypes = {
  'dispatch': React.PropTypes.func,
  'field': React.PropTypes.object,
  'input': React.PropTypes.object,
  'size': React.PropTypes.string,
  'static': React.PropTypes.bool,
  'locale': React.PropTypes.object
};
WrapPlupload.defaultProps = {};

export default WrapPlupload;
