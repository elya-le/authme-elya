import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './GroupDetailPage.css';

const GroupDetailPage = () => {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [error, setError] = useState(null);

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

    return (
        <div className="group-detail-page">
            <Link to="/groups" className="breadcrumb">Groups</Link>
            <div className="group-header">
                <img src={group.GroupImages[0]?.url} alt={`${group.name}`} className="group-image" />
                <div className="group-info">
                    <h1>{group.name}</h1>
                    <p>{group.city}, {group.state}</p>
                    <p>{group.numMembers} events · {group.private ? 'Private' : 'Public'}</p>
                    <p>Organized by: {group.Organizer.firstName} {group.Organizer.lastName}</p>
                    <button className="join-group-button" onClick={() => alert('Feature coming soon')}>
                        Join this group
                    </button>
                </div>
            </div>
            <div className="group-about">
                <h2>What we&apos;re about</h2>
                <p>{group.about}</p>
            </div>
            <div className="group-events">
                <h2>Upcoming Events ({group.Events.filter(event => new Date(event.startDate) > new Date()).length})</h2>
                {group.Events.filter(event => new Date(event.startDate) > new Date()).map(event => (
                    <div key={event.id} className="event-card">
                        <img src={event.previewImage} alt={`${event.name}`} className="event-image" />
                        <div className="event-info">
                            <h3>{event.name}</h3>
                            <p>{new Date(event.startDate).toLocaleString()}</p>
                            <p>{event.location}</p>
                        </div>
                    </div>
                ))}
                <h2>Past Events ({group.Events.filter(event => new Date(event.startDate) <= new Date()).length})</h2>
                {group.Events.filter(event => new Date(event.startDate) <= new Date()).map(event => (
                    <div key={event.id} className="event-card">
                        <img src={event.previewImage} alt={`${event.name}`} className="event-image" />
                        <div className="event-info">
                            <h3>{event.name}</h3>
                            <p>{new Date(event.startDate).toLocaleString()}</p>
                            <p>{event.location}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupDetailPage;
