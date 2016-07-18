require 'rails_helper'

describe GoogleEvent do
  describe '.list_events' do
    let!(:sample_conference_room1) { create :conference_room }
    let!(:sample_conference_room2) { create :conference_room }
    let(:sample_time1) { DateTime.now.beginning_of_week }
    let(:sample_time2) { DateTime.now.beginning_of_week + 1.days }
    let(:sample_end_time1) { sample_time1 + 2.hours }
    let(:sample_end_time2) { sample_time2 + 2.hours }

    let(:sample_event1) do
      build :event, start_time: sample_time1, end_time: sample_end_time1, conference_room: sample_conference_room1, user: 'name', description: sample_summary
    end
    let(:sample_event2) do
      build :event, start_time: sample_time2, end_time: sample_end_time2, conference_room: sample_conference_room2, user: 'name', description: sample_summary
    end

    let(:sample_summary) { 'Nice summary' }

    let(:google_event1) do
      Google::Apis::CalendarV3::Event.new(start: Google::Apis::CalendarV3::EventDateTime.new(date_time: sample_event1.start_time),
                                          creator: Google::Apis::CalendarV3::Event::Creator.new(display_name: sample_event1.user),
                                          end: Google::Apis::CalendarV3::EventDateTime.new(date_time: sample_event1.end_time),
                                          summary: sample_event1.name, description: sample_summary)
    end
    let(:google_event2) do
      Google::Apis::CalendarV3::Event.new(start: Google::Apis::CalendarV3::EventDateTime.new(date_time: sample_event2.start_time),
                                          creator: Google::Apis::CalendarV3::Event::Creator.new(display_name: sample_event2.user),
                                          end: Google::Apis::CalendarV3::EventDateTime.new(date_time: sample_event2.end_time),
                                          summary: sample_event2.name, description: sample_summary)
    end
    let(:sample_events) do
      [google_event1, google_event2]
    end

    let(:expected_events) do
      {
        1 => [sample_event1],
        2 => [sample_event2]
      }
    end

    it 'returns list of events where ints are keys and Array[Event] are values' do
      service = double('service')
      events = double('events')

      allow(events).to receive(:items) { sample_events }
      allow(GoogleEvent).to receive(:calendar_service) { service }
      allow(service).to receive(:batch).and_yield(service)
      allow(service).to receive(:list_events) do |email, &block|
        if email == ConferenceRoom.first.email
          block.call [double('EventList', items: [google_event1]), nil]
        else
          block.call [double('EventList', items: [google_event2]), nil]
        end
      end

      expect(GoogleEvent.list_events('', sample_time1, sample_time1)).to satisfy do |response|
        response.all? do |day, _|
          response[day].each_with_index.all? do |event, i|
            event.attributes == expected_events[day][i].attributes
          end
        end
      end
    end
  end

  describe '.create' do
    context 'given invalid params' do
      it 'raises ArgumentError' do
        allow(GoogleEvent).to receive(:params_valid?) { false }
        expect { GoogleEvent.create({}, 0, {}) }.to raise_error ArgumentError
      end
    end
  end

  describe '.dates_not_empty?' do
    context 'given appropriate values' do
      let(:time1) { Faker::Time.forward 5 }
      let(:time2) { Faker::Time.forward 5 }
      let(:params){ {start: {date_time: time1}, end: {date_time: time2}} }
      it 'returns true' do
        expect(GoogleEvent.dates_not_empty?(params)).to eq true
      end
    end

    context 'given not hash fields' do
      let(:params) { { start: [], end: [] } }

      it 'returns false' do
        expect(GoogleEvent.dates_not_empty?(params)).to eq false
      end
    end

    context 'given empty fields' do

      let(:params) { { start: {}, end: {} } }
      it 'return false' do
        expect(GoogleEvent.dates_not_empty?(params)).to eq false
      end
    end
  end

  describe '.params_valid?' do
    context 'given not hash params argument' do
      let(:params){ [] }
      it 'returns false' do
        expect(GoogleEvent.params_valid?(params)).to eq false
      end
    end

    context 'given hash params without date and start' do
      let(:params){ {key1: Faker::Lorem.word, key2: Faker::Lorem.word} }
      it 'returns false' do
        expect(GoogleEvent.params_valid?(params)).to eq false
      end
    end

    context 'given hash params' do
      let(:params){ {start: {date_time: Faker::Time.forward(5)}, end: {date_time: Faker::Time.forward(6)}} }
      context 'with valid date and end fields' do
        it 'returns true' do
          allow(GoogleEvent).to receive(:dates_not_empty?) { true }
          expect(GoogleEvent.params_valid?(params)).to eq true
        end
      end

      context 'with invalid date and end fields' do
        it 'returns false' do
          allow(GoogleEvent).to receive(:dates_not_empty?) { false }
          expect(GoogleEvent.params_valid?(params)).to eq false
        end
      end
    end
  end

  describe '.add_rooms_to_event' do
    context 'given array of calendar room ids' do
      let(:mordor_id){1}
      let(:neverland_id){2}
      let(:mordor_email){'u2i.com_2d3631343934393033313035@resource.calendar.google.com'}
      let(:neverland_email){'u2i.com_3530363130383730383638@resource.calendar.google.com'}
      let(:expected_result){
        {attendees: [
            {email: mordor_email},
            {email: neverland_email}]}
      }
      let(:calendar_room_ids){[mordor_id, neverland_id]}
      let(:params){{}}
      let(:mordor_room){double("mordor", email: mordor_email)}
      let(:neverland_room){double("neverland", email: neverland_email)}
      let(:id_to_room){ {mordor_id => mordor_room, neverland_id => neverland_room} }
      it 'adds new key in hash and assigns array of conference room emails to it' do

        allow(ConferenceRoom).to receive(:find_by) do |**args|
          id_to_room[args[:id]]
        end
        GoogleEvent.add_rooms_to_event(params, calendar_room_ids)
        expect(params).to eq expected_result
      end
    end
  end
end
