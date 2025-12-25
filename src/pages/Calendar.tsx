

import { useState, useMemo } from "react";

interface CalendarEvent {
  date: Date;
  title: string;
  type: "academic" | "holiday" | "event" | "parent";
  color: "blue" | "green" | "purple" | "yellow" | "red";
}

interface UpcomingEvent {
  date: string;
  title: string;
  description: string;
  time: string;
  location: string;
  type: string;
  typeColor: string;
}

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedFilter, setSelectedFilter] = useState("all");

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const schoolEvents: CalendarEvent[] = [
    { date: new Date(2025, 3, 14), title: "Term 3 Begins", type: "academic", color: "blue" },
    { date: new Date(2025, 3, 25), title: "Parent Conference", type: "parent", color: "yellow" },
    { date: new Date(2025, 4, 1), title: "Labor Day", type: "holiday", color: "green" },
    { date: new Date(2025, 4, 5), title: "Testing Begins", type: "academic", color: "blue" },
    { date: new Date(2025, 4, 9), title: "Testing Ends", type: "academic", color: "blue" },
    { date: new Date(2025, 4, 30), title: "Indian Arrival Day", type: "holiday", color: "green" },
    { date: new Date(2025, 5, 16), title: "Sports Day", type: "event", color: "purple" },
    { date: new Date(2025, 5, 19), title: "Corpus Christi", type: "holiday", color: "green" },
    { date: new Date(2025, 6, 1), title: "Emancipation Day", type: "holiday", color: "green" },
    { date: new Date(2025, 6, 4), title: "Last Day of School", type: "academic", color: "blue" },
  ];

  const upcomingEvents: UpcomingEvent[] = [
    {
      date: "Apr 25",
      title: "Parent-Teacher Conference Night",
      description: "Meet with your child's teachers to discuss academic progress. Scheduled appointments between 4:00 PM - 7:00 PM.",
      time: "4:00 PM - 7:00 PM",
      location: "School Auditorium",
      type: "Parent Meeting",
      typeColor: "blue",
    },
    {
      date: "May 5-9",
      title: "Standardized Testing Week",
      description: "Annual standardized testing for all students. Please ensure students arrive on time and have a good breakfast.",
      time: "All Day",
      location: "All Classrooms",
      type: "Academic",
      typeColor: "purple",
    },
    {
      date: "Jun 16",
      title: "Annual Sports Day",
      description: "Fun-filled day of athletic events and competitions. Parents are welcome to attend and cheer for their children.",
      time: "9:00 AM - 2:00 PM",
      location: "School Field",
      type: "School Event",
      typeColor: "yellow",
    },
  ];

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500",
    };
    return colors[color] || "bg-gray-500";
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const firstDayIndex = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const days = [];

    // Empty cells
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    // Days of month
    for (let day = 1; day <= totalDays; day++) {
      days.push(day);
    }

    return days;
  }, [currentMonth, currentYear]);

  const getEventsForDay = (day: number) => {
    if (!day) return [];
    return schoolEvents.filter(
      (event) =>
        event.date.getDate() === day &&
        event.date.getMonth() === currentMonth &&
        event.date.getFullYear() === currentYear &&
        (selectedFilter === "all" || event.type === selectedFilter)
    );
  };

  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-red to-red-600 text-white py-12">
        <div className="container-wide px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <i className="fas fa-calendar-alt mr-3"></i>School Calendar
            </h1>
            <p className="text-xl opacity-90">
              Important dates, events, and academic schedules for the 2025-2026 school year
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="font-semibold">Current Term:</span> Term 3 (Apr 14 - Jul 4, 2025)
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="font-semibold">Next Holiday:</span> Independence Day - Aug 31
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Controls & Filters */}
      <section className="bg-white py-8 border-b border-gray-200">
        <div className="container-wide px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Month Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrevMonth}
                className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-primary-black">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <p className="text-gray-600">Term 3: April 14 - July 4, 2025</p>
              </div>
              <button
                onClick={handleNextMonth}
                className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>

            {/* Event Filters */}
            <div className="flex flex-wrap gap-3">
              {[
                { filter: "all", label: "All Events", icon: "fa-calendar" },
                { filter: "academic", label: "Academic", icon: "fa-graduation-cap" },
                { filter: "holiday", label: "Holidays", icon: "fa-umbrella-beach" },
                { filter: "event", label: "School Events", icon: "fa-users" },
                { filter: "parent", label: "Parent Meetings", icon: "fa-user-friends" },
              ].map((btn) => (
                <button
                  key={btn.filter}
                  onClick={() => setSelectedFilter(btn.filter)}
                  className={`filter-btn ${selectedFilter === btn.filter ? "active" : ""} px-4 py-2 rounded-lg transition-colors ${
                    selectedFilter === btn.filter
                      ? "bg-primary-red text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <i className={`fas ${btn.icon} mr-2`}></i>
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Jump */}
          <div className="mt-8">
            <h3 className="font-semibold text-gray-700 mb-3">Quick Jump to:</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { href: "#important-dates", icon: "fa-star", label: "Important Dates" },
                { href: "#term-dates", icon: "fa-calendar-week", label: "Term Dates" },
                { href: "#upcoming-events", icon: "fa-bullhorn", label: "Upcoming Events" },
                { href: "#downloads", icon: "fa-download", label: "Downloads" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="quick-jump-link px-4 py-2 bg-gray-100 rounded-lg hover:bg-primary-red hover:text-white transition-colors"
                >
                  <i className={`fas ${link.icon} mr-2`}></i>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Grid */}
      <section className="py-12 bg-gray-50">
        <div className="container-wide px-4">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
              <div
                key={day}
                className={`text-center font-bold p-3 ${idx === 0 || idx === 6 ? "text-primary-red" : ""}`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              const dayEvents = day ? getEventsForDay(day) : [];
              const isToday = isCurrentMonth && day === today.getDate();

              return (
                <div
                  key={idx}
                  className={`min-h-24 p-3 rounded-lg border ${
                    day === null
                      ? "bg-white border-transparent"
                      : isToday
                        ? "bg-yellow-50 border-yellow-400"
                        : "bg-white border-gray-200 hover:border-primary-red"
                  }`}
                >
                  {day && (
                    <>
                      <div className="font-bold text-primary-black mb-2">{day}</div>
                      {dayEvents.length > 0 && (
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map((event, eventIdx) => (
                            <div
                              key={eventIdx}
                              className={`w-2 h-2 rounded-full ${getColorClass(event.color)}`}
                              title={event.title}
                            ></div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-gray-500">+{dayEvents.length - 3}</div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-12 pt-8 border-t border-gray-300">
            <h3 className="font-bold text-lg mb-4">Event Legend</h3>
            <div className="flex flex-wrap gap-4">
              {[
                { color: "blue", label: "Academic Dates" },
                { color: "green", label: "Holidays" },
                { color: "purple", label: "School Events" },
                { color: "yellow", label: "Parent Meetings" },
                { color: "red", label: "Important Deadlines" },
              ].map((item) => (
                <div key={item.color} className="flex items-center">
                  <div className={`w-4 h-4 ${getColorClass(item.color)} rounded mr-2`}></div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Important Dates */}
      <section id="important-dates" className="py-12 bg-white">
        <div className="container-wide px-4">
          <h2 className="section-title text-center mb-10">
            <i className="fas fa-star text-primary-red mr-3"></i>Important Dates 2025-2026
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                term: "Term 1",
                dates: "Sep 2 - Dec 13, 2025",
                events: [
                  "Sep 2: First Day of School",
                  "Oct 13: Parent-Teacher Conferences",
                  "Nov 10-14: Mid-Term Break",
                  "Dec 13: Last Day of Term",
                ],
              },
              {
                term: "Term 2",
                dates: "Jan 6 - Apr 3, 2026",
                events: [
                  "Jan 6: Term 2 Begins",
                  "Feb 14: Valentine's Day Celebration",
                  "Mar 3-7: Carnival Break",
                  "Apr 3: Term 2 Ends",
                ],
              },
              {
                term: "Term 3",
                dates: "Apr 14 - Jul 4, 2026",
                events: [
                  "Apr 14: Term 3 Begins",
                  "May 5-9: Standardized Testing Week",
                  "Jun 16: Sports Day",
                  "Jul 4: Graduation & Last Day",
                ],
              },
            ].map((term) => (
              <div key={term.term} className="bg-red-50 rounded-xl p-6 border border-red-100">
                <div className="flex items-center mb-4">
                  <div className="bg-primary-red text-white rounded-lg px-4 py-2 font-bold">
                    {term.term}
                  </div>
                  <span className="ml-4 font-semibold">{term.dates}</span>
                </div>
                <ul className="space-y-3">
                  {term.events.map((event, idx) => (
                    <li key={idx} className="flex items-start">
                      <i className="fas fa-circle text-xs text-primary-red mt-2 mr-3"></i>
                      <span>{event}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events List */}
      <section id="upcoming-events" className="py-12 bg-gray-50">
        <div className="container-wide px-4">
          <h2 className="section-title text-center mb-10">
            <i className="fas fa-bullhorn text-primary-red mr-3"></i>Upcoming Events
          </h2>

          <div className="max-w-4xl mx-auto">
            {upcomingEvents.map((event, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-xl shadow-md p-6 mb-6 border-l-4 ${
                  event.typeColor === "blue"
                    ? "border-blue-500"
                    : event.typeColor === "purple"
                      ? "border-purple-500"
                      : "border-yellow-500"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center mb-2">
                      <div
                        className={`${
                          event.typeColor === "blue"
                            ? "bg-blue-500"
                            : event.typeColor === "purple"
                              ? "bg-purple-500"
                              : "bg-yellow-500"
                        } text-white rounded-lg px-3 py-1 font-bold mr-4`}
                      >
                        {event.date}
                      </div>
                      <h3 className="text-xl font-bold">{event.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-3">{event.description}</p>
                    <div className="flex items-center mt-3 text-sm text-gray-500">
                      <i className="fas fa-clock mr-2"></i>
                      <span>{event.time}</span>
                      <i className="fas fa-map-marker-alt ml-4 mr-2"></i>
                      <span>{event.location}</span>
                      <span
                        className={`ml-4 px-2 py-1 rounded text-xs font-semibold ${
                          event.typeColor === "blue"
                            ? "bg-blue-100 text-blue-800"
                            : event.typeColor === "purple"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {event.type}
                      </span>
                    </div>
                  </div>
                  <button className="btn-primary px-6 py-3 whitespace-nowrap">
                    <i className="fas fa-calendar-plus mr-2"></i>Add to Calendar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Downloads Section */}
      <section id="downloads" className="py-12 bg-white">
        <div className="container-wide px-4">
          <h2 className="section-title text-center mb-10">
            <i className="fas fa-download text-primary-red mr-3"></i>Calendar Downloads
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: "fa-file-pdf", color: "red", title: "2025-2026 Calendar (PDF)", desc: "Complete school year calendar in printable format" },
              { icon: "fa-calendar-alt", color: "blue", title: "Digital Calendar (ICS)", desc: "Import all school events to your digital calendar" },
              { icon: "fa-print", color: "green", title: "Printable Version", desc: "Printer-friendly monthly calendar pages" },
            ].map((download, idx) => (
              <a
                key={idx}
                href="#"
                className="download-card group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <div className="text-center mb-4">
                  <i
                    className={`fas ${download.icon} text-${download.color}-500 text-3xl`}
                  ></i>
                </div>
                <h3 className="font-bold text-lg mb-2 text-center">{download.title}</h3>
                <p className="text-gray-600 text-center mb-4 text-sm">{download.desc}</p>
                <div className="bg-primary-red text-white text-center py-2 rounded-lg group-hover:bg-red-700 transition-colors">
                  <i className="fas fa-download mr-2"></i> Download
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
