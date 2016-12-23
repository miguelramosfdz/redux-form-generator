import React from 'react';
import _has from 'lodash/has';
import _map from 'lodash/map';
import _get from 'lodash/get';
import _pick from 'lodash/pick';
import _filter from 'lodash/filter';
import Col from 'react-bootstrap/lib/Col';
import FormControl from 'react-bootstrap/lib/FormControl';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';

class Wrap extends React.Component {

  constructor() {
    super();
    this.input = {};
    this.custom = {};
    this.dropdownButton = this.dropdownButton.bind(this);
    this.dropDown = this.dropDown.bind(this);
    this.renderField = this.renderField.bind(this);
    this.options = this.options.bind(this);
  }

  options() {
    if (this.props.field.type === 'select') {
      return _map(_get(this.props.field, 'options', []), (option, key) => {
        return <option key={key} value={option.value}>{option.desc}</option>;
      });
    }
  }

  dropDown() {
    const menuItem = [];
    let dropDownTitle = null;
    _map(this.custom.items, (item, key) => {
      const select = () => {
        this.input.onBlur();
        this.input.onChange(item.value);
      };

      if (item.hasOwnProperty('default')) {
        dropDownTitle = item.default;
        menuItem.push(<MenuItem key={key} onSelect={select}>{item.default}</MenuItem>);
        menuItem.push(<MenuItem key={key + '_div'} divider/>);
      } else {
        if (this.input.value === item.value) {
          dropDownTitle = item.desc;
        }
        menuItem.push(<MenuItem key={key} onSelect={select}>{item.desc}</MenuItem>);
      }
    });
    return {dropDownTitle, menuItem};
  }


  dropdownButton(isStatic) {
    const {dropDownTitle, menuItem} = this.dropDown();
    const size = _get(this.props.field, 'bsSize', this.props.size);
    const thisSize = () => {
      if (size !== 'medium') {
        return ({bsSize: size});
      }
    };


    if (isStatic === true) {
      return (
        <FormControl.Static>
          {dropDownTitle || _get(this.custom, 'placeholder')}
        </FormControl.Static>
      );
    }

    return (
      <DropdownButton key={this.input.name}
                      onClick={(event) => {
                        event.preventDefault();
                      }}
                      {...thisSize()}
                      title={dropDownTitle || _get(this.custom, 'placeholder')}
                      id={'input-dropdown-addon' + this.input.name}>
        {menuItem}
      </DropdownButton>
    );
  }

  renderField(props) {
    const {input, label, help, meta: {touched, error, valid}, ...custom} = props;
    this.input = input;
    this.custom = custom;
    const size = _get(this.props.field, 'bsSize', this.props.size);

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

    const add = _pick(custom, ['type', 'placeholder', 'rows', 'cols']);
    if (add.type === 'select') {
      add.componentClass = 'select';
    }

    const component = () => {
      if (this.props.static === true || _get(this.props.field, 'static', false) === true) {
        const value = () => {
          if (props.type === 'select') {
            return _map(_filter(this.props.field.options, {value: this.input.value}), (item, key) => {
              return (<span key={key}>{item.desc}</span>);
            });
          }
          return this.input.value;
        };

        switch (props.type) {
          case 'dropDown':
            return this.dropdownButton(true);
          default: {
            return (
              <FormControl.Static>
                {value()}
              </FormControl.Static>);
          }
        }
      }

      switch (props.type) {
        case 'dropDown':
          return this.dropdownButton(false);
        case 'textarea':
          return (<FormControl
            componentClass="textarea"
            {...input}
            {...add}
          />);
        default:
          return (<FormControl
            {...input}
            {...add}
          >
            {this.options()}
          </FormControl>);
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


    const buttonBefore = () => {
      if (_has(this.props.field, 'buttonBefore')) {
        if(this.props.field.buttonBefore.type === 'button') {
          return (<InputGroup.Button>{this.props.addField(this.props.field.buttonBefore, 1, size)}</InputGroup.Button>);
        }
        return (<InputGroup.Button>{this.props.addField(this.props.field.buttonBefore, 1, size)}</InputGroup.Button>);
      }
    };

    const buttonAfter = () => {
      if (_has(this.props.field, 'buttonAfter')) {
        if(this.props.field.buttonAfter.type === 'button') {
          return (<InputGroup.Button>{this.props.addField(this.props.field.buttonAfter, 1, size)}</InputGroup.Button>);
        }
        return this.props.addField(this.props.field.buttonAfter, 1, size);
      }
    };


    const addonBefore = () => {
      if (_has(this.props.field, 'addonBefore')) {
        return (<InputGroup.Addon>{_get(this.props.field, 'addonBefore')}</InputGroup.Addon>);
      }
    };

    const addonAfter = () => {
      if (_has(this.props.field, 'addonAfter')) {
        return (<InputGroup.Addon>{_get(this.props.field, 'addonAfter')}</InputGroup.Addon>);
      }
    };

    const getField = () => {
      if (_has(this.props.field, 'addonBefore')
        || _has(this.props.field, 'addonAfter')
        || _has(this.props.field, 'buttonBefore')
        || _has(this.props.field, 'buttonAfter')
      ) {
        return(
          <InputGroup>
            {buttonBefore()}
            {addonBefore()}
            {component()}
            {addonAfter()}
            {buttonAfter()}
          </InputGroup>
        );
      }

      return component();
    };

    if (this.props.field.type === 'dropDown' && !_has(this.props.field, 'label')) {
      return getField();
    }

    return (
      <FormGroup
        {...thisSize()}
        validationState={validationState()}
      >
        <Col componentClass={ControlLabel} {...labelSize()}>
          {label}
        </Col>
        <Col {...fieldSize()}>
          {getField()}
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

Wrap.propTypes = {
  'field': React.PropTypes.object,
  'size': React.PropTypes.string,
  'addField': React.PropTypes.func,
  'static': React.PropTypes.bool,
  'locale': React.PropTypes.object
};
Wrap.defaultProps = {};

export default Wrap;
