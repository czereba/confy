import React from 'react';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

const { array, func } = React.PropTypes;

export default class FormLocationField extends React.Component {
  static propTypes = {
    conferenceRooms: array.isRequired,
    onChange:        func.isRequired
  };

  render() {
    const conferenceRoomsOptions = this.props.conferenceRooms.map(room => (
      <option value={room.id} key={room.id}>{room.title}</option>
    ));

    return (
      <FormGroup>
        <ControlLabel>Location:</ControlLabel>
        <FormControl componentClass="select"
                     onChange={this.props.onChange}
                     name="location">
          {conferenceRoomsOptions}
        </FormControl>
      </FormGroup>
    );
  }
}
