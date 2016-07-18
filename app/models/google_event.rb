class GoogleEvent
  class << self
    #You can specify custom fields: https://developers.google.com/google-apps/calendar/v3/reference/events
    FIELDS = "items(start, end, summary, recurrence, creator(displayName))".freeze

    def list_events(credentials, starting, ending)
      events = {}
      rooms = ConferenceRoom.all
      calendar_service(credentials).batch do |service|
        rooms.each do |room|
          config = { fields: FIELDS, single_events: true, time_min: starting.rfc3339(9),
                     time_max: ending.rfc3339(9), time_zone: 'Europe/Warsaw' }
          service.list_events(room.email, config) do |result, _|
            next unless result
            result.items&.each do |event|
              events[event.start.date_time.wday] ||= []
              events[event.start.date_time.wday] << Event.new(
                  user: event.creator.display_name,
                  end_time: event.end.date_time,
                  start_time: event.start.date_time,
                  conference_room: room,
                  description: event.description,
                  name: event.summary
              )
            end
          end
        end
      end
      events
    end

    def format_params(params)
      params[:start] = { date_time: DateTime.parse(params[:start_time]).rfc3339(9) }
      params[:end] = { date_time: DateTime.parse(params[:end_time]).rfc3339(9) }
      params.delete(:start_time)
      params.delete(:end_time)
      params.delete(:conference_room_id)
      params.delete(:permitted)
      params.to_h
    end

    def create(credentials, conference_room_ids, params = {})
      params = params.try :deep_symbolize_keys
      raise ArgumentError unless params_valid?(params)
      add_rooms_to_event(params, conference_room_ids)
      event = Google::Apis::CalendarV3::Event.new(params)
      calendar_service(credentials).insert_event('primary', event)
    end

    def add_rooms_to_event(params, conference_room_ids)
      params[:attendees] = []
      conference_room_ids.map do |conference_room_id|
        conference_room_email = ConferenceRoom.find_by(id: conference_room_id).email
        params[:attendees] << {email: conference_room_email}
      end
    end

    def params_valid?(params)
      return false unless params.is_a? Hash
      obligatory_keys = %i(start end)
      obligatory_keys.all? { |key| params.key?(key) }
      dates_not_empty?(params)
    end

    def dates_not_empty?(params)
      return false unless (params[:start].is_a? Hash) || (params[:end].is_a? Hash)
      params[:start][:date_time].present? && params[:end][:date_time].present?
    end

    def calendar_service(credentials)
      Google::Apis::CalendarV3::CalendarService.new.tap { |s| s.authorization = client(credentials) }
    end

    def client(credentials)
      Signet::OAuth2::Client.new(JSON.parse(credentials))
    end

    def load_emails
      ConferenceRoom.pluck(:email)
    end

  end

  private_class_method :calendar_service, :client, :load_emails

end