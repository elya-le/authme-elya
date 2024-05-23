import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './GroupListPage.css'; 

const GroupListPage = () => {
    const [groups, setGroups] = useState([]); 
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/groups')
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data.Groups)) { // ensure this matches the API response structure
                    setGroups(data.Groups);
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
        <div className="group-list-page">
            <header className="headers">
                <h2 className="header-gray">Events</h2>
                <h2 className="header-teal">Groups</h2>
            </header>
            <p className="caption">Groups in MeetPup</p>
            <div className="group-list">
                {groups.map((group, index) => (
                    <div key={group.id}>
                        {index > 0 && <hr className="group-divider" />}
                        <Link to={`/groups/${group.id}`} className="group-item-link">
                            <div className="group-card">
                                <div className="group-image">
                                {group.GroupImages && group.GroupImages.length > 0 ? (
                                    <img src={group.GroupImages[0].url} alt={`${group.name} Thumbnail`} className="group-thumbnail" /> // display the first image if available
                                ) : (
                                    <img src="/images/img.png" alt="Default Group" className="group-thumbnail" /> // display a default image if no images are available
                                )}
                                </div>
                                <div className="group-details">
                                    <h3 className="group-name">{group.name}</h3>
                                    <p className="group-location">{group.city}, {group.state}</p>
                                    <p className="group-description">{group.about}</p>
                                    <p className="group-events">
                                        {group.numEvents} events · {group.isPrivate ? 'Private' : 'Public'}
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