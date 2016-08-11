import moment from 'moment';
import flow from 'lodash/fp/flow';
import keys from 'lodash/fp/keys';
import map from 'lodash/fp/map';
import find from 'lodash/fp/find';
import ReactDOM from 'react-dom';
import React, { PropTypes } from 'react';
import { Table } from 'react-bootstrap';
import { loadFilters, saveFilters } from 'helpers/FiltersHelper';
import EventSchema from 'schemas/EventSchema';
import { setEventsPositionAttributes } from 'helpers/EventHelper';
import RoomFilters from './filters/RoomFilters';
import CalendarRow from './CalendarRow';
import CalendarHeader from './CalendarHeader';

import './calendar.scss';

const { string, number, shape, array, arrayOf, oneOfType, instanceOf, func, object } = PropTypes;

export default class Calendar extends React.Component {
  static propTypes = {
    events:  arrayOf(EventSchema.only('start_timestamp', 'end_timestamp', 'conference_room')).isRequired,
    conferenceRooms:  array,
    days: arrayOf(oneOfType([instanceOf(Date), string])).isRequired,
    times:  arrayOf(oneOfType([instanceOf(Date), string])).isRequired,
    unitEventLengthInSeconds: number.isRequired,
    timeFormat: string,
    dateFormat: string,
    roomKinds:  object.isRequired,
    onDelete: func.isRequired,
    scrollTo: shape({ hours: number, minutes: number })
  };

  static defaultProps = {
    events:   [],
    scrollTo: { hours: 0, minutes: 0 }
  };

  constructor(...args) {
    super(...args);
    this.state = { filteredRooms: loadFilters() };
    this.rows = {};

    this._addFilter = this._addFilter.bind(this);
    this._removeFilter = this._removeFilter.bind(this);
  }

  componentDidMount() {
    this._scrollToRow();
  }

  render() {
    let headerNodes = this.props.days.map(day => (
      <CalendarHeader day={day} dateFormat={this.props.dateFormat} key={day} />
    ));

    const filteredEvents = this._filterEvents();
    setEventsPositionAttributes(filteredEvents);
    let rowNodes = this.props.times.map(time => (
      <CalendarRow time={time}
                   key={time}
                   events={filteredEvents}
                   days={this.props.days}
                   unitEventLengthInSeconds={this.props.unitEventLengthInSeconds}
                   onDelete={this.props.onDelete}
                   ref={(ref) => this.rows[moment(time).unix()] = ref} />
    ));

    return (
      <div>
        <RoomFilters onEnabled={this._addFilter}
                     onDisabled={this._removeFilter}
                     conferenceRooms={this.props.conferenceRooms}
                     filters={this.state.filteredRooms.toArray()}
                     roomKinds={this.props.roomKinds} />
        <Table bordered striped responsive className="calendar">
          <thead>
            <tr>
              <th className="time-cell" />
              {headerNodes}
            </tr>
          </thead>
          <tbody>
            {rowNodes}
          </tbody>
        </Table>
      </div>
    );
  }

  _addFilter(conferenceRoomId) {
    const filters = this.state.filteredRooms.add(conferenceRoomId);
    saveFilters(filters);
    this.setState({ filteredRooms: filters });
  }

  _removeFilter(conferenceRoomId) {
    const filters = this.state.filteredRooms.delete(conferenceRoomId);
    saveFilters(filters);
    this.setState({ filteredRooms: filters });
  }

  _filterEvents() {
    return this.props.events.filter((event) => !this._eventIsFiltered(event));
  }

  _eventIsFiltered(event) {
    return this.state.filteredRooms.has(event.conference_room.id);
  }

  _findRow(hours, minutes) {
    const time = flow(
      keys,
      map(t => moment.unix(t)),
      find(t => t.hours() === hours && t.minutes() === minutes)
    )(this.rows);

    return this.rows[time.unix()];
  }

  _scrollToRow() {
    const { hours, minutes } = this.props.scrollTo;
    const node = ReactDOM.findDOMNode(this._findRow(hours, minutes));
    if (node.scrollIntoView) {
      node.scrollIntoView();
    }
  }
}

