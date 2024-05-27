import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './EventCard.css';
import '../../Main.css';

const EventListPage = () => {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/events')
            .then(response => response.json())
            .then(data => {
                console.log('Fetched data:', data);
                if (Array.isArray(data.Events)) {
                    const now = new Date(); // sort events by date
                    const sortedEvents = data.Events.sort((a, b) => {
                        const dateA = new Date(a.startDate);
                        const dateB = new Date(b.startDate);
                        if (dateA >= now && dateB >= now) {
                            return dateA - dateB; // both are upcoming events
                        } else if (dateA < now && dateB < now) {
                            return dateA - dateB; // both are past events
                        } else if (dateA >= now && dateB < now) {
                            return -1; // a is upcoming and b is past
                        } else {
                            return 1; // a is past and b is upcoming
                        }
                    });
                    setEvents(sortedEvents);
                } else {
                    setError('Invalid data format');
                }
            })
            .catch(err => setError(err.message));
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className='list-page'>
            <div className='list-section1'>
                <header className='list-headers'>
                    <h2 className='header-teal'>Events</h2>
                    <Link to='/groups' className='header-gray'>
                        <h2>Groups</h2>
                    </Link>
                </header>
                <p className='list-page-caption'>Events in MeetPup</p>
            </div>
            <div className='list-section2'>
                {events.map((event) => (
                    <div key={event.id} className='event-item'>
                        <hr className='event-divider' />
                        <Link to={`/events/${event.id}`} className='event-list-card-link'>
                            <div className='event-card-top'>
                                <div className='event-card-image'>
                                    {event.EventImages && event.EventImages.length > 0 ? (
                                        <img src={event.EventImages[0].url} alt={`${event.name} Thumbnail`} className='event-card-thumbnail' />
                                    ) : (
                                        <img src='/images/img.png' alt='Default Event' className='event-card-thumbnail' />
                                    )}
                                </div>
                                <div className='event-card-details'>
                                    <p className='event-card-time'>
                                        {/* {new Date(event.startDate).toLocaleDateString()} &middot; {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} */}
                                        {new Date(event.startDate).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            hour12: true,
                                            timeZoneName: 'short'
                                        }).toUpperCase()}
                                    </p>
                                    <h3 className='event-card-name'>{event.name}</h3>
                                    <p className='event-card-groupId'>
                                        {event.Group?.name} &middot; {event.Venue?.city}, {event.Venue?.state}
                                    </p>
                                    {/* <p className='event-card-location'>
                                    </p> */}
                                    {/* <p className='event-card-attendees'>
                                        {event.Attendees && event.Attendees.length > 0
                                            ? `${event.Attendees.length} attendees`
                                            : 'No attendees yet'}
                                    </p> */}
                                </div>
                            </div>
                            <div className='event-card-bottom'>
                                <p className='event-description'>{event.description || 'No description available'}</p>
                                {console.log('Event description:', event.description)}
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventListPage;
