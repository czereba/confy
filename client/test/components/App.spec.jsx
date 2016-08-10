import React from 'react';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import EventSource from 'sources/EventSource';
import Event from 'test/factories/Event';
import User from 'test/factories/User';
import DefaultProps from 'test/factories/DefaultProps';

import App from 'components/App';
import SideNav from 'components/layout/SideNav';

describe('<App />', () => {
  sinon.stub(EventSource, 'fetch').resolves([]);
  sinon.stub(EventSource, 'remove').resolves([]);

  before(() => {
    proxyquire('../../app/sources/EventSource', EventSource);
  });

  let props;
  beforeEach(() => {
    props = DefaultProps.build();
  });

  after(() => {
    EventSource.fetch.restore();
    EventSource.remove.restore();
  });

  afterEach(() => {
    EventSource.fetch.reset();
    EventSource.remove.reset();
  });

  it('prefetches events', () => {
    mount(<App {...props} />);
    expect(EventSource.fetch).to.have.been.calledOnce();
  });

  describe('refresh', () => {
    it('updates events', () => {
      const wrapper = shallow(<App {...props} />);
      wrapper.find(SideNav).simulate('refresh');
      expect(EventSource.fetch).to.have.been.calledOnce();
    });
  });

  describe('delete', () => {
    before(() => {
      document.querySelector = function querySelector(_e) {
        return { content: 'xxx' };
      };
    });

    it('deletes event', () => {
      const event = Event.build({ creator: User.build({ self: true }) });
      const wrapper = mount(<App {...props} initialEvents={[[event]]} />);

      wrapper.find('.delete-button').simulate('click');

      expect(EventSource.remove).to.have.been.calledOnce();
      expect(EventSource.remove).to.have.been.calledWith(event.id);
    });
  });
});