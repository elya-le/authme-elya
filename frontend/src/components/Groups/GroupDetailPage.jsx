import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../Events/EventCard.css';
import './GroupDetailPage.css';
import '../../Main.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faUsers, faUser } from '@fortawesome/free-solid-svg-icons';

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
          console.log('Group data fetched:', data); // log the fetched group data
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
    <div className='group-detail-page'>
      <div className='group-detail-breadcrumb'>
        <span className='breadcrumb-symbol'>&lt;</span> 
        <Link to='/groups' className='breadcrumb-text'>Groups</Link>
      </div>
      <div className='section2-group-detail-container'>
        {group.GroupImages && group.GroupImages.length > 0 ? (
          <img src={group.GroupImages[0].url} alt={`${group.name}`} className="group-detail-image" /> 
        ) : (
          <img src='/images/img.png' alt="Default Group" className="group-detail-image" /> 
        )}
        <div className="group-detail-info-container">
          <h1>{group.name}</h1>
        <div className='group-card-info'>
          <p><FontAwesomeIcon icon={faMapMarkerAlt} /> {group.city}, {group.state}</p><br/>
          <p><FontAwesomeIcon icon={faUsers} /> {group.numEvents} events &middot;{" "} {group.private ? 'Private' : 'Public'}</p><br/>
          <p><FontAwesomeIcon icon={faUser} /> Organized by: <b> {group.Organizer.firstName} {group.Organizer.lastName} </b></p>
        </div>
        <div className='group-button-container'>
          {isLoggedIn && !isOrganizer && (
            <button className='join-group-button' onClick={() => alert('Feature coming soon')}>
            Join this group
            </button>
          )}
          {isLoggedIn && isOrganizer && (
            <div className='organizer-buttons'>
              <button className='create-event-button'>Create event</button>
              <button className='update-group-button'>Update</button>
              <button className='delete-group-button'>Delete</button>
            </div>
          )}
        </div>
        </div>
      </div>
      <div className='section3-bottom-container'>
        <div className='group-about'>
          <h2>Organizer</h2>
          <p>{group.Organizer.firstName} {group.Organizer.lastName}</p>
        </div>
        <div className='group-about'>
          <h2>What we&apos;re about</h2>
          <p>{group.about}</p>
        </div>
        <div className='group-events'>
          {upcomingEvents.length > 0 && ( // render only if there are upcoming events
          <>
          <h2>Upcoming Events ({upcomingEvents.length})</h2>
            {upcomingEvents.map(event => (
              <Link to={`/events/${event.id}`} key={event.id} className='event-card-link'> 
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
                    <p className='event-card-location'>
                      {event.Venue?.address}<br/>
                      {event.Venue?.city}, {event.Venue?.state}
                    </p>
                    </div>
                  </div>
                  <div className='event-card-bottom'>
                    <p className='event-description'>{event.description || 'No description available'}</p>
                    {console.log('Event description:', event.description)}
                  </div>
              </Link>
            ))}
          </>
          )}
          {pastEvents.length > 0 && ( // render only if there are past events
          <>
            <h2>Past Events ({pastEvents.length})</h2>
            {pastEvents.map(event => (
              <Link to={`/events/${event.id}`} key={event.id} className="event-card-link"> 
                <div className='event-card-top'>
                  <div className='event-card-image'>
                    {event.EventImages && event.EventImages.length > 0 ? (
                      <img src={event.EventImages[0].url} alt={`${event.name} Thumbnail`} className='event-card-thumbnail' />
                    ) : (
                      <img src='/images/img.png' alt='Default Event' className='event-card-thumbnail' />
                    )}
                  </div>
                  <div className='event-card-details'>
                    <p className='event-card-time'>{new Date(event.startDate).toLocaleDateString()} &middot; {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <h3 className='event-card-name'>{event.name}</h3>
                    <p className='event-card-location'>
                      {event.Venue?.address}<br/>
                      {event.Venue?.city}, {event.Venue?.state}
                    </p>
                  </div>
                </div>
                <div className='event-card-bottom'>
                  <p className='event-description'>{event.description || 'No description available'}</p>
                  {console.log('Event description:', event.description)}
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
