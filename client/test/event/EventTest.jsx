import React from 'react';
import { shallow } from 'enzyme';
import Event from '../../app/components/calendar/event/Event';
import { expect } from 'chai';
import { _ } from 'lodash';

describe('<Event />', () => {
  const eventSummary = 'Sample Event';
  const creator = { email: 'creator@example.com', self: true };
  const sampleRoom = {
    id: 8,
    capacity: 10,
    title: 'Narnia One',
    color: '#dffabd',
    email: 'email@resource.calendar.google.com'
  };
  const sampleEvent = {
    attendees: [{ response_status: 'needsAction', self: true }],
    creator,
    end: { date_time: '2016-07-25T02:30:00.000+02:00' },
    id: '7utc9k4fds8kf2734q72dsoq8c',
    start: { date_time: '2016-07-25T00:30:00.000+02:00' },
    conference_room: sampleRoom,
    start_timestamp: 1469397600,
    end_timestamp: 1469406600,
    summary: eventSummary
  };
  const containerHeight = 30;
  const unitEventLengthInSeconds = 30 * 60;
  const timeFormat = 'HH:mm';

  it('renders correctly', () => {
    const wrapper = shallow(
      <Event
      event={sampleEvent}
      containerHeight={containerHeight}
      unitEventLengthInSeconds={unitEventLengthInSeconds}
      timeFormat={timeFormat} />
    );
    expect(wrapper.find('div')).to.have.length(5);
    expect(wrapper.find('.event').props().style.height).to.eq(150);
    expect(wrapper.find('.event').props().style.backgroundColor).to.eq(sampleRoom.color);
    expect(wrapper.find('.event-time').text()).to.include('00:30');
    expect(wrapper.find('.event-name').text()).to.include(eventSummary);
    expect(wrapper.find('.event-user').text()).to.include(creator.email);
    expect(wrapper.find('.event-location').text()).to.include(sampleRoom.title);
  });

  it('renders correctly with other length', () => {
    let eventClone = _.cloneDeep(sampleEvent);
    eventClone.end_timestamp += 60 * 60; // 1 hour
    eventClone.end.date_time = '2016-07-25T03:30:00.000+02:00';
    const wrapper = shallow(
      <Event
      event={eventClone}
      containerHeight={containerHeight}
      unitEventLengthInSeconds={unitEventLengthInSeconds}
      timeFormat={timeFormat} />
    );
    expect(wrapper.find('.event').props().style.height).to.eq(210);
  });

  it('renders display_name when present', () => {
    let eventClone = _.cloneDeep(sampleEvent);
    let creatorClone = _.cloneDeep(creator);
    creatorClone.display_name = 'Display name';
    eventClone.creator = creatorClone;
    const wrapper = shallow(
      <Event
      event={eventClone}
      containerHeight={containerHeight}
      unitEventLengthInSeconds={unitEventLengthInSeconds}
      timeFormat={timeFormat} />
    );
    expect(wrapper.find('.event-user').text()).to.include(creatorClone.display_name);
  });
});
