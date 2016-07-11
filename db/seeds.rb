# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

day_time = Time.now.beginning_of_week
conference_rooms = ["Mordor", "Neverland", "Sherwood Forest", "Valhalla", "Voyager", "Winterfell", "Yellow Submarine"].map do |name|
  params = { capacity: rand(5..20), color: "#%06x" % (rand * 0xffffff) }
  ConferenceRoom.where(title: name).first_or_create(params).tap { |cr| cr.update(params) }
end

event_id = 0

4.times do |i|
  day_time += 1.days
  4.times do |j|
    start_time = day_time + j.hours * 3
    end_time = start_time + rand(1..2).hours + 30*(rand(0..1)).minutes
    params = {
        start_time: start_time,
        end_time: end_time,
        name: Faker::Company.name,
        description: Faker::Company.catch_phrase,
        conference_room: conference_rooms.sample,
        user: Faker::Name.name
    }
    if (event = Event.all[event_id])
      event.update(params)
    else
      Event.create(params)
    end
    event_id += 1
  end
end
