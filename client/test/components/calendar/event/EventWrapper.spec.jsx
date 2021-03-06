import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import Event from 'test/factories/Event';

import EventWrapper from 'components/calendar/event/EventWrapper';
import EventGroup from 'components/calendar/event/EventGroup';

describe('<EventWrapper />', () => {
  const eventProps = {
    eventsInGroup:            1,
    offset:                   0,
    timestamp:                new Date().getTime(),
    unitEventLengthInSeconds: 60
  };
  const onDelete = sinon.spy();

  const mountEventWrapper = (events) => mount(<EventWrapper events={events} {...eventProps} onDelete={onDelete} />);

  const events = Event.buildList(1);

  context('when events prop is not empty', () => {
    it('renders <EventGroup />', () => {
      const wrapper = mountEventWrapper(events);
      expect(wrapper).to.have.exactly(1).descendants(EventGroup);
    });
  });

  context('when events prop is empty', () => {
    it('should not render <EventGroup />', () => {
      const wrapper = mountEventWrapper([]);
      expect(wrapper).to.not.have.descendants(EventGroup);
    });
  });

  context('when not passed in events', () => {
    it('should not render <EventGroup />', () => {
      const wrapper = mountEventWrapper();
      expect(wrapper).to.not.have.descendants(EventGroup);
    });
  });

  context('component dimensions', () => {
    const spy = sinon.spy(EventWrapper.prototype, 'setState');

    afterEach(() => {
      spy.reset();
    });

    after(() => {
      spy.restore();
    });

    const spyArg = (index) => spy.getCall(0).args[index];

    it('sets width and height', () => {
      mountEventWrapper(events);
      expect(spy).to.have.been.called();
      expect(spyArg(0)).to.include.all.keys('width', 'height');
    });

    it('updates on window resize', () => {
      mountEventWrapper(events);
      spy.reset();
      window.dispatchEvent(new window.Event('resize'));

      expect(spy).to.have.been.called();
      expect(spyArg(0)).to.include.all.keys('width', 'height');
    });
  });
});
