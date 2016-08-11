require 'google/apis/calendar_v3'
require 'google/api_client/client_secrets'

class CalendarController < ApplicationController
  include GoogleAuthentication

  before_action :refresh_token
  before_action :check_authentication

  # Index for showing events from Google calendar
  def index
    create_calendar_props
  rescue ArgumentError
    session.delete(:credentials)
    redirect_to oauth2callback_path
  end

  private

  def create_calendar_props
    @props = {conferenceRooms: ConferenceRoom.all,
              initialEvents: events,
              days: calendar_days,
              times: calendar_times,
              unitEventLengthInSeconds: EventGrouper::GRANULARITY,
              date: params[:date],
              roomKinds: ConferenceRoom::KINDS,
              scrollTo: {hours: 6, minutes: 0}}.compact
  end

  def date_param
    params[:date] ? Date.parse(params[:date]) : Date.today
  end

  def events
    events = GoogleEventLister.new(session[:credentials], session[:email]).call(TimeInterval.week(date_param))
    EventGrouper.new(events).build_blocks
  end

  def calendar_days
    TimeInterval.week(date_param).collect_steps(1.day)
  end

  def calendar_times
    TimeInterval.day.collect_steps(EventGrouper::GRANULARITY)
  end
end
