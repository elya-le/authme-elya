import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './GroupDetailPage.css';

const GroupDetailPage = () => {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [error, setError] = useState(null);
    const currentUser = useSelector(state => state.session.user);

    useEffect(() => {
        fetch(`/api/groups/${groupId}`)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    setGroup(data); 
                } else {
                    setError('Group not found');
                }
            })
            .catch(err => setError(err.message));
    }, [groupId]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!group) {
        return <div>Loading...</div>;
    }

    const isLoggedIn = !!currentUser;
    const isOrganizer = currentUser && currentUser.id === group.organizerId;

    const sortedEvents = group.Events.slice().sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    const upcomingEvents = sortedEvents.filter(event => new Date(event.startDate) > new Date());
    const pastEvents = sortedEvents.filter(event => new Date(event.startDate) <= new Date());

    return (
        <div className="group-detail-page">
            <div className='breadcrumb'>
                <span>&lt;</span> 
                <Link to="/groups" className="breadcrumb-link">Groups</Link>
            </div>
            <div className="group-detail-card-main">
                {group.GroupImages && group.GroupImages.length > 0 ? (
                    <img src={group.GroupImages[0].url} alt={`${group.name}`} className="group-detail-image" /> 
                ) : (
                    <img src="/images/default-group.jpg" alt="Default Group" className="group-detail-image" /> 
                )}
                <div className="group-detail-card-info-container">
                    <div className="group-detail-card-info-header">
                    <h1>{group.name}</h1>
                    <p>{group.city}, {group.state}</p>
                    <p>{group.numEvents} events &middot;{" "} {group.private ? 'Private' : 'Public'}</p> 
                    <p>Organized by: {group.Organizer.firstName} {group.Organizer.lastName}</p>

                    </div>
                    
                    <div className='group-detail-button-container'>
                        {isLoggedIn && !isOrganizer && (
                            <button className="join-group-button" onClick={() => alert('Feature coming soon')}>
                                Join this group
                            </button>
                        )}
                        {isLoggedIn && isOrganizer && (
                            <div className="organizer-buttons">
                                <button className="create-event-button">Create event</button>
                                <button className="update-group-button">Update</button>
                                <button className="delete-group-button">Delete</button>
                            </div>
                        )}
                    </div>
                    
                </div>
            </div>
            <div className='bottom-container'>
                <div className="group-about">
                    <h2>Organizer</h2>
                    <p>{group.Organizer.firstName} {group.Organizer.lastName}</p>
                </div>
                <div className="group-about">
                    <h2>What we&apos;re about</h2>
                    <p>{group.about}</p>
                </div>
                <div className="group-events">
                    {upcomingEvents.length > 0 && ( // render only if there are upcoming events
                        <>
                            <h2>Upcoming Events ({upcomingEvents.length})</h2>
                            {upcomingEvents.map(event => (
                                <Link to={`/events/${event.id}`} key={event.id} className="event-card-link"> {/* Link to event detail page */}
                                    <div key={event.id} className="event-card">
                                        <div className="event-info-top">
                                            <img src={group.GroupImages[0].url} alt={`${group.name}`} className="group-image" />
                                            <div className="event-title">
                                                <p>
                                                    {new Date(event.startDate).toLocaleDateString()} &middot; {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <h3>{event.name}</h3>
                                                <p>{event.Venue?.address}<br/>{event.Venue?.city}, {event.Venue?.state} </p> {/* corrected typo and added null check */}
                                    
                                            </div>     
                                        </div>
                                        <div className="event-info-bottom">
                                            <p className="group-description">{group.about}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </>
                        )}
                        
                        {pastEvents.length > 0 && ( // render only if there are past events
                            <>
                                <h2>Past Events ({pastEvents.length})</h2>
                                {pastEvents.map(event => (
                                    <Link to={`/events/${event.id}`} key={event.id} className="event-card-link"> {/* Link to event detail page */}
                                        <div key={event.id} className="event-card">
                                            <div className="event-info-top">
                                                <img src={group.GroupImages[0].url} alt={`${group.name}`} className="group-image" />
                                                <div className="event-title">
                                                    <p>
                                                        {new Date(event.startDate).toLocaleDateString()} &middot; {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    <h3>{event.name}</h3>
                                                    <p>{event.location}</p>
                                                </div>     
                                            </div>
                                            <div className="event-info-bottom">
                                                <p className="group-description">{group.about}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </>
                        )}
                </div>
            </div>
        </div>
    );
};

export default GroupDetailPage;
