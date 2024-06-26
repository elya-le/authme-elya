import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './GroupListPage.css'; 
import '../../Main.css';

const GroupListPage = () => {
  const [groups, setGroups] = useState([]); 
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/groups')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data.Groups)) { 
          setGroups(data.Groups);
        } else {
          setError('Invalid data format');
        }
      })
      .catch(err => setError(err.message));
  }, []);

  const handleImageError = (e) => {
    e.target.src = '/images/img.png'; // set fallback image only once
    e.target.onerror = null; // remove onError handler to prevent infinite loop
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className='list-page'>
      <div className='list-section1'>
        <header className='list-headers'>
          <Link to='/events' className='header-gray'>
            <h2>Events</h2>
          </Link>
          <h2 className='header-teal'>Groups</h2>
        </header><br></br>
        <p className='list-page-caption'>Groups in MeetPup</p>
      </div>
      <div className='list-section2'>
        {groups.map((group) => (
          <div key={group.id} className='group-item'>
            <hr className='group-divider'/>
            <Link to={`/groups/${group.id}`} className='group-card-link'>
              <div className='group-card-top'>
                <div className="group-image">
                  {group.GroupImages && group.GroupImages.length > 0 ? (
                    <img
                      src={`${group.GroupImages[group.GroupImages.length - 1].url}?${new Date().getTime()}`} // add timestamp to URL
                      alt="Group Thumbnail"
                      className='group-card-thumbnail'
                      onError={handleImageError} // updated onError handler
                    />
                  ) : (
                    <img
                      src='/images/img.png'
                      alt="Default Group"
                      className='group-card-thumbnail'
                    />
                  )}
                </div>
                <div className='group-details'>
                  <h3 className='group-name'>{group.name}</h3> 
                  <p className='group-location'>{group.city}, {group.state}</p>
                  <p className='group-description'>{group.about}</p>
                  <p className='group-events'>
                    {group.numEvents} EVENTS &middot;{' '}
                    {group.private ? 'PRIVATE GROUP' : 'PUBLIC GROUP'}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupListPage;
