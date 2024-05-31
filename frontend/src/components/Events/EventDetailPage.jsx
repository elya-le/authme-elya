import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // useNavigate instead of useHistory
import { useSelector } from 'react-redux';
import './EventDetailPage.css';
import '../../Main.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faClock, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import DeleteEventConfirmationModal from './DeleteEventConfirmationModal';

const EventDetailPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate(); // useNavigate instead of useHistory
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  const handleDeleteEvent = async () => {
    try {
      const csrfToken = document.cookie.split('=')[1]; // Get CSRF token from cookie
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken, // Include CSRF token in the request headers
        }
      });
      if (response.ok) {
        navigate(`/groups/${event.groupId}`); // navigate instead of history.push
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete event');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className='event-detail-page'>
      <div className='section1-event-header'>
        <div className='event-detail-breadcrumb'>
          <span className='breadcrumb-symbol'>&lt;</span> 
          <Link to='/events' className='breadcrumb-text'>Events</Link>
        </div>
        <div className='event-detail-name'>
          <h1>{event.name}</h1><br/>
          <p>Hosted by: {event.Group.Organizer.firstName} {event.Group.Organizer.lastName}</p>
        </div>
      </div>
      <div className='section2-event-body'>
        <div className='event-detail-top-container'>
          <div className='event-image-container'>
          {event.EventImages && event.EventImages.length > 0 ? (
            <img src={event.EventImages[0].url} alt={`${event.name}`} className='event-detail-image' /> 
          ) : (
            <img src='/images/img.png' alt={`${event.name} Image`} className='event-detail-image' /> 
          )}
          </div>
          <div className='event-details-info-container'>
            <Link to={`/groups/${event.groupId}`} className='group-info-link'>
              <div className='event-details-group-card'>
                <img src={event.Group.groupImageUrl || '/images/img.png'} alt={event.Group.name} className='event-details-group-image' />
                <div className='event-details-group-card-info'>
                  <h3 className='group-title'>{event.Group.name}</h3> 
                  <p>{event.Group.private ? 'Private' : 'Public'}</p>  
                </div>     
              </div>
            </Link>
            <div className='event-details-event-card'>
                <div className='event-card-info'>
                  <div className='event-details-card-time'>    
                    <FontAwesomeIcon icon={faClock} className='clock-icon' /> 
                    <p>
  START: {new Date(event.startDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  }).toUpperCase()} &middot; {new Date(event.startDate).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZoneName: 'short'
  }).toUpperCase()} <br/>
  END: {new Date(event.endDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  }).toUpperCase()} &middot; {new Date(event.endDate).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZoneName: 'short'
  }).toUpperCase()}
</p><br/>
                  </div> <br></br>
                  <p><FontAwesomeIcon icon={faDollarSign} className='event-icon'/> {event.price ? `$${event.price}` : 'Free'} </p><br/>
                  <p><FontAwesomeIcon icon={faUser} className='event-icon' /> {event.type === 'In person' ? 'In person' : 'Online'}</p>
                    {event.type === 'In person' && event.Venue && (
                      <>
                        <br />
                        <p>{event.Venue.address}</p>
                        <p>{event.Venue.city}, {event.Venue.state}</p>
                      </>
                    )}
                </div>
              <div className='event-meta'>
              <br></br>   
              </div>
              {isCurrentUserHost() && (
              <div className='event-organizer-buttons'>
                <button className='update-event-button'>Update</button>
                <button className='delete-event-button' onClick={() => setShowDeleteModal(true)}>Delete</button> 
              </div>
            )}
            </div>
          </div>
        </div>
        <div className='event-detail-bottom-container'>
          <div className='event-details'>
            <h2>Details</h2>
            <br/>
            <p>{event.description}</p>
          </div>
        </div>
      </div>
      <DeleteEventConfirmationModal 
        show={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onConfirm={handleDeleteEvent} 
      />
    </div>
  );
};

export default EventDetailPage;
