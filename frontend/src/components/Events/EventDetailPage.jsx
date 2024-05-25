import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './EventDetailPage.css';
import '../../Main.css';

const EventDetailPage = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [error, setError] = useState(null);

    const currentUser = useSelector(state => state.session.user);

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

    const isCurrentUserHost = () => {
        if (!currentUser || !event.Group) {
            return false;
        }
        return currentUser.id === event.Group.organizerId;
    };

    return (
        <div className='event-detail-page'>
            <div className='section1-event-header'>
                <div className='event-detail-breadcrumb'>
                    <span>&lt;</span> 
                    <Link to="/events" className="event-breadcrumb-link">Events</Link>
                </div>
                <div className='event-detail-name'>
                    <h2>{event.name}</h2>
                    <p>Hosted by: {event.Group.Organizer.firstName} {event.Group.Organizer.lastName}</p>
                </div>
            </div>
            <div className="section2-event-body">
                <div className='event-detail-top-container'>
                    <div className='event-image-container'>
                    {event.EventImages && event.EventImages.length > 0 ? (
                        <img src={event.EventImages[0].url} alt={`${event.name}`} className="event-detail-image" /> 
                    ) : (
                        <img src="/images/img.png" alt={`${event.name} Image`} className="event-detail-image" /> 
                    )}
                    </div>
                    <div className='event-details-info-container'>
                        <Link to={`/groups/${event.groupId}`} className="group-info-link">
                            <div className='event-details-group-card'>
                                <img src={event.Group.groupImageUrl || "/images/img.png"} alt={event.Group.name} className='event-details-group-image' />
                                <div className='event-details-group-card-info'>
                                    <h3 className="event-title">{event.Group.name}</h3> 
                                    <p>{event.Group.private ? 'Private' : 'Public'}</p>  
                                </div>     
                            </div>
                        </Link>
                        <div className='event-details-event-card'>
                            <div className="event-meta">
                                <p><i className="fas fa-clock" aria-hidden="true"></i> START {new Date(event.startDate).toLocaleDateString()} · {new Date(event.startDate).toLocaleTimeString()} <br/> END {new Date(event.endDate).toLocaleDateString()} · {new Date(event.endDate).toLocaleTimeString()}</p>
                                <p><i className="fas fa-dollar-sign" aria-hidden="true"></i> {event.price ? `$${event.price}` : 'Free'}</p>
                                <p><i className="fas fa-map-pin" aria-hidden="true"></i> {event.type === 'In person' ? 'In person' : 'Online'}</p>
                            </div>
                            {isCurrentUserHost() && (
                            <div className="event-organizer-buttons">
                                <button className="update-event-button">Update</button>
                                <button className="delete-event-button">Delete</button>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
                <div className='event-detail-bottom-container'>
                    <div className="event-details">
                        <h2>Details</h2>
                        <br/>
                        <p>{event.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailPage;
