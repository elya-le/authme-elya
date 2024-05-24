import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './EventDetailPage.css';

const EventDetailPage = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`/api/events/${eventId}`)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    setEvent(data);
                } else {
                    setError('Event not found');
                }
            })
            .catch(err => setError(err.message));
    }, [eventId]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!event) {
        return <div>Loading...</div>;
    }

    return (
        <div className="event-detail-page">
            <div className="breadcrumb">
                <Link to="/events" className="breadcrumb-link">&lt; Events</Link>
            </div>
            <h1>{event.name}</h1>
            <p>Hosted by {event.hostFirstName} {event.hostLastName}</p>

            <div className="event-content">
                <div className="event-image">
                    <img src={event.imageUrl || "/images/default-event.jpg"} alt={event.name} />
                </div>
                <div className="event-details">
                    <Link to={`/groups/${event.groupId}`} className="group-info-link">
                        <div className="group-info">
                            <img src={event.groupImageUrl || "/images/default-group.jpg"} alt={event.groupName} />
                            <div>
                                <h2>{event.groupName}</h2>
                                <p>{event.groupType}</p>
                            </div>
                        </div>
                    </Link>
                    <div className="event-meta">
                        <p>Start: {new Date(event.startDate).toLocaleDateString()} at {new Date(event.startDate).toLocaleTimeString()}</p>
                        <p>End: {new Date(event.endDate).toLocaleDateString()} at {new Date(event.endDate).toLocaleTimeString()}</p>
                        <p>{event.price ? `$${event.price}` : 'Free'}</p>
                        <p>{event.inPerson ? 'In person' : 'Online'}</p>
                    </div>
                </div>
            </div>
            <div className="event-details">
                <h2>Details</h2>
                <p>{event.description}</p>
            </div>
        </div>
    );
};

export default EventDetailPage;
