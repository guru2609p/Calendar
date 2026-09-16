import { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export default function CalendarView() {
    const [events, setEvents] = useState([
        {
            title: 'Project Kickoff',
            room: 'Conference Room A',
            start: new Date(2026, 8, 4, 10, 0),
            end: new Date(2026, 8, 4, 11, 30),
        }
    ]);

    const [currentView, setCurrentView] = useState('month');
    const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 4));
    const [isOpen, setIsOpen] = useState(false);

    // Form inputs
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventRoom, setNewEventRoom] = useState('');
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [startTime, setStartTime] = useState('00:00');
    const [endTime, setEndTime] = useState('12:00');

    // UI state trackers
    const [editingEvent, setEditingEvent] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Open form for a blank slot selection
    const handleSelectSlot = (slotInfo) => {
        setEditingEvent(null);
        setIsEditMode(true);
        setSelectedSlot(slotInfo);
        setNewEventTitle('');
        setNewEventRoom('');
        setStartTime(moment(slotInfo.start).format('HH:mm'));
        setEndTime(moment(slotInfo.end).format('HH:mm'));
        setIsOpen(true);
    };

    // Open information view for an existing item
    const handleSelectEvent = (event) => {
        setEditingEvent(event);
        setIsEditMode(false);
        setNewEventTitle(event.title);
        setNewEventRoom(event.room || '');
        setStartTime(moment(event.start).format('HH:mm'));
        setEndTime(moment(event.end).format('HH:mm'));
        setIsOpen(true);
    };

    // Merges HH:mm picker values back into standard JS Dates
    const mergeDateTime = (baseDate, timeString) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        const newDate = new Date(baseDate);
        newDate.setHours(hours, minutes, 0, 0);
        return newDate;
    };

    // Create and Edit updates
    const handleSaveEvent = () => {
        if (!newEventTitle.trim()) return;

        const baseDate = editingEvent ? editingEvent.start : selectedSlot.start;
        const finalStart = mergeDateTime(baseDate, startTime);
        const finalEnd = mergeDateTime(baseDate, endTime);

        if (editingEvent) {
            setEvents((prev) =>
                prev.map((evt) =>
                    evt.title === editingEvent.title && evt.start.getTime() === editingEvent.start.getTime()
                        ? { ...evt, title: newEventTitle, room: newEventRoom, start: finalStart, end: finalEnd }
                        : evt
                )
            );
        } else if (selectedSlot) {
            setEvents((prev) => [
                ...prev,
                { title: newEventTitle, room: newEventRoom, start: finalStart, end: finalEnd }
            ]);
        }
        closeModal();
    };
    const handleDeleteEvent = () => {
        if (editingEvent) {
            setEvents((prev) =>
                prev.filter((evt) => evt.title !== editingEvent.title || evt.start.getTime() !== editingEvent.start.getTime())
            );
        }
        closeModal();
    };

    const closeModal = () => {
        setIsOpen(false);
        setSelectedSlot(null);
        setEditingEvent(null);
        setIsEditMode(false);
    };

    // Modal time viewer helpers
    const activeStart = editingEvent ? editingEvent.start : selectedSlot?.start;
    const activeEnd = editingEvent ? editingEvent.end : selectedSlot?.end;
    const dateStr = activeStart ? moment(activeStart).format('MMMM Do, YYYY') : '';
    const timeStr = activeStart && activeEnd ? `${moment(activeStart).format('h:mm a')} - ${moment(activeEnd).format('h:mm a')}` : '';

    return (
        <div style={{ height: '80vh', padding: '20px', background: '#fff', color: '#333', position: 'relative' }}>
            <h2>My Schedule</h2>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view={currentView}
                onView={setCurrentView}
                date={currentDate}
                onNavigate={setCurrentDate}
                defaultView="month"
                selectable={true}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                titleAccessor={(event) => event.room ? `${event.title} (${event.room})` : event.title}
                style={{ height: 'calc(100% - 40px)' }}
            />

            {isOpen && (
                <div style={{
                    position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
                    background: '#f9f9f9', padding: '20px', border: '2px solid #0078d4',
                    borderRadius: '8px', zIndex: 2000, boxShadow: '0px 4px 10px rgba(0,0,0,0.25)', width: '320px'
                }}>
                    {isEditMode ? (
                        <>
                            <h3 style={{ margin: '0 0 10px 0' }}>{editingEvent ? 'Edit Event' : 'Add Event'}</h3>
                            <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>{dateStr}</div>

                            <input
                                type="text"
                                placeholder="Event Title..."
                                value={newEventTitle}
                                onChange={(e) => setNewEventTitle(e.target.value)}
                                style={{ width: '90%', padding: '8px', marginBottom: '10px', display: 'block' }}
                            />
                            <input
                                type="text"
                                placeholder="Room Location..."
                                value={newEventRoom}
                                onChange={(e) => setNewEventRoom(e.target.value)}
                                style={{ width: '90%', padding: '8px', marginBottom: '15px', display: 'block' }}
                            />

                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', width: '95%' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#555' }}>Start Time</label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#555' }}>End Time</label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button onClick={() => editingEvent ? setIsEditMode(false) : closeModal()} style={{ padding: '6px 12px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleSaveEvent} style={{ padding: '6px 12px', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 style={{ margin: '0 0 5px 0', color: '#0078d4' }}>{editingEvent?.title}</h3>
                            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '500', color: '#444' }}>Room: {editingEvent?.room || 'No Room Assigned'}</p>

                            <div style={{ margin: '15px 0', fontSize: '13px', background: '#eee', padding: '8px', borderRadius: '4px' }}>
                                <div> <strong>Date:</strong> {dateStr}</div>
                                <div style={{ marginTop: '4px' }}> <strong>Time:</strong> {timeStr}</div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                                <button onClick={handleDeleteEvent} style={{ padding: '6px 12px', background: '#d83b01', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={closeModal} style={{ padding: '6px 12px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
                                    <button onClick={() => setIsEditMode(true)} style={{ padding: '6px 12px', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
