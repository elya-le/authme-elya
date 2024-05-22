import { useState, useEffect } from 'react';
import SignupFormModal from '../SignupFormModal/SignupFormModal';
import OpenModalButton from '../OpenModalButton/OpenModalButton';
import './LandingPage.css'; // import the CSS file

const LandingPage = () => {
    const [groups, setGroups] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch groups from your backend API
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

    return (
        <div className="landing-page">
            <section className="section1">
                <div className="text">
                    <h1>Welcome to MeetPup</h1>
                    <p className="intro-text">Whatever your adventure, from city strolls and beach romps to playful pup events, there are thousands of furry friends waiting on Meet Pup. PAW-some activities are happening daily.</p>
                </div>
                <div className="infographic">
                    <img src="../../images/lp-infographic1.png" alt="Infographic" /> {/* update the path to your infographic */}
                </div>
            </section>

            <section className="section2">
                <h2>Where tails wag and friendships blossom</h2>
                <p>Unleash the fun with events and groups for every pup</p>
            </section>

            <section className="section3">
                <div className="column">
                    <div className="icon"></div> {/* replace with actual icon */}
                    <a href="/groups" className="link">See all groups</a>
                    <p>Find your pack among our groups—join the fun and start wagging</p>
                </div>
                <div className="column">
                    <div className="icon"></div> {/* replace with actual icon */}
                    <a href="/events" className="link">Find an event</a>
                    <p>Sniff out events that bring together paws and people for endless fun.</p>
                </div>
                <div className="column">
                    <div className="icon"></div> {/* replace with actual icon */}
                    <a href="/events" className="link">Start a new group</a>
                    <p>Gather furr-ends and create your own MeetPup group to share adventures with</p>
                </div>
            </section>

            <section className="section4">
                <OpenModalButton
                    buttonText="Join MeetPup"
                    modalComponent={<SignupFormModal />}
                    className="signup-button"
                />
            </section>

            <section className="section5">
                <h2>Explore MeetPup Groups</h2>
                <div className="groups-grid">
                    {error ? (
                        <div className="error">{error}</div>
                    ) : (
                        groups.map(group => (
                            <div key={group.id} className="group-card">
                                <img src={group.GroupImages[0]?.url || '/default-image.png'} alt={`${group.name} Thumbnail`} className="group-thumbnail" />
                                <div className="group-info">
                                    <h3>{group.name}</h3>
                                    <p>{group.city}, {group.state}</p>
                                    <p>{group.about}</p>
                                    <p>{group.numEvents} events · {group.private ? 'Private' : 'Public'}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default LandingPage;

