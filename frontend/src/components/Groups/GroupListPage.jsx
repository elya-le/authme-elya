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
                if (Array.isArray(data.Groups)) { // Ensure this matches the API response structure
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
                {groups.map(group => (
                    <Link to={`/groups/${group.id}`} key={group.id} className="group-item-link">
                        <div className="group-item">
                            <img src={group.GroupImages[0]?.url || '/default-image.png'} alt={`${group.name} Thumbnail`} className="group-thumbnail" />
                            <div className="group-details">
                                <h3 className="group-name">{group.name}</h3>
                                <p className="group-location">{group.city}, {group.state}</p>
                                <p className="group-description">{group.about}</p>
                                <p className="group-events">
                                    {group.numEvents} events · {group.private ? 'Private' : 'Public'}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default GroupListPage;
