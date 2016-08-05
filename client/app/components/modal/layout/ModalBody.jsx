import React from "react";
import {Modal} from "react-bootstrap";
import _ from "lodash";
import FormTextField from "./body/FormTextField";
import FormDateField from "./body/FormDateField";
import FormLocationField from "./body/FormLocationField";
import ErrorField from "./ErrorField";

const { func, array, object, bool } = React.PropTypes;

export default class ModalBody extends React.Component {
  static propTypes = {
    updateParam:      func.isRequired,
    conferenceRooms:  array.isRequired,
    errors:           object,
    showErrorMessage: bool
  };

  static defaultProps = {
    showErrorMessage: false
  };

  constructor(props) {
    super(props);

    _.bindAll(this,
      ['handleTextFieldChange', 'handleLocationChange', 'handleStartTimeChange', 'handleEndTimeChange']);
  }

  handleTextFieldChange(e) {
    const value = e.target.value;
    const name = e.target.name;

    this.props.updateParam(name, value);
  }

  handleLocationChange(e) {
    this.props.updateParam('conferenceRoomId', e.target.value);
  }

  _updateDateParam(key, value) {
    if (value !== 'Invalid date') {
      this.props.updateParam(key, value);
    }
  }

  handleStartTimeChange(e) {
    this._updateDateParam('startTime', e);
  }

  handleEndTimeChange(e) {
    this._updateDateParam('endTime', e);
  }

  render() {
    return (
      <Modal.Body>
        <ErrorField show={this.props.showErrorMessage} />
        <form>
          <FormTextField
            name={"summary"}
            onChange={this.handleTextFieldChange} />
          <FormTextField
            name={"description"}
            onChange={this.handleTextFieldChange} />
          <FormDateField
            label={"Start time"}
            onChange={this.handleStartTimeChange} />
          <FormDateField
            label={"End time"}
            onChange={this.handleEndTimeChange} />
          <FormLocationField
            conferenceRooms={this.props.conferenceRooms}
            onChange={this.handleLocationChange}
            validationState={!!this.props.errors.conference_room_id}
            errors={this.props.errors.conference_room_id || []} />
        </form>
      </Modal.Body>
    );
  }
}
