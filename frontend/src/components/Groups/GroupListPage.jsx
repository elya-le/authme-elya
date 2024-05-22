import { useState, useEffect } from 'react';
import './GroupListPage.css'; 

const GroupListPage = () => {
    const [groups, setGroups] = useState([]); 
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/groups')
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setGroups(data);
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
            <p className="caption">Groups in Meetup</p>
            <div className="group-list">
                {groups.map(group => (
                    <div key={group.id} className="group-item">
                        <img src={group.thumbnail} alt={`${group.name} Thumbnail`} className="group-thumbnail" />
                        <div className="group-details">
                            <h3 className="group-name">{group.name}</h3>
                            <p className="group-location">{group.city}, {group.state}</p>
                            <p className="group-description">{group.about}</p>
                            <p className="group-events">
                                {group.numEvents} events · {group.isPrivate ? 'Private' : 'Public'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupListPage;
