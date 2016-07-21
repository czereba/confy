import React, { PropTypes } from 'react'
import { Col, Table } from 'react-bootstrap'

import { formatDate, formatTime } from 'helpers/dateHelper'

import CalendarRow from './CalendarRow'

import './calendar.scss'

const CalendarHeader = (props) => (
  <th className="col-md-2 text-center">
    {formatDate(props.day, props.dateFormat)}
  </th>
);

export default class Calendar extends React.Component {
  static propTypes = {
    events: PropTypes.array,
    days: PropTypes.arrayOf(PropTypes.string).isRequired,
    times: PropTypes.arrayOf(PropTypes.string).isRequired,
    timeFormat: PropTypes.string,
    dateFormat: PropTypes.string
  };

  static defaultProps = {
    events: []
  };

  render() {
    let headerNodes = this.props.days.map(day => (
      <CalendarHeader day={day} dateFormat={this.props.dateFormat} key={day} />
    ));

    let rowNodes = this.props.times.map(time => (
      <CalendarRow time={time}
                   days={this.props.days}
                   timeFormat={this.props.timeFormat} 
                   events={this.props.events}
                   key={time} />
    ));

    return (
      <Table bordered striped responsive className="calendar">
        <thead>
        <tr>
          <th className="col-md-1"/>
          {headerNodes}
        </tr>
        </thead>
        <tbody>
        {rowNodes}
        </tbody>
      </Table>
    );
  }
};

