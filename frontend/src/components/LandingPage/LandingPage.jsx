import { useState, useEffect } from 'react';
import SignupFormModal from '../SignupFormModal/SignupFormModal';
import OpenModalButton from '../OpenModalButton/OpenModalButton';
import GroupCard from '../Groups/GroupCard'; // updated import path
import './LandingPage.css';

const LandingPage = () => {
    const [groups, setGroups] = useState([]);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

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

    useEffect(() => {
        fetch('/api/session')
            .then(response => response.json())
            .then(data => {
                if (data.user) {
                    setCurrentUser(data.user);
                }
            })
            .catch(err => console.error('Error fetching user session:', err));
    }, []);

    return (
        <div className="landing-page">
            <section className="section1">
                <div className="text">
                    <h1>Welcome to MeetPup</h1>
                    <p className="intro-text">Whatever your adventure, from city strolls and beach romps to playful pup events, there are thousands of furry friends waiting on Meet Pup. PAW-some activities are happening daily.</p>
                </div>
                <div className="infographic">
                    <img src="../../images/lp-infographic1.png" alt="Infographic" />
                </div>
            </section>

            <section className="section2">
                <h2>Where tails wag and friendships blossom</h2>
                <p>Unleash the fun with events and groups for every pup</p>
            </section>

            <section className="section3">
                <div className="column">
                    <img src="../../images/img.png" alt="Icon" className="small-icon" />
                    <a href="/groups" className="link">See all groups</a>
                    <p>Find your pack among our groups—join the fun and start wagging</p>
                </div>
                <div className="column">
                    <img src="../../images/img.png" alt="Icon" className="small-icon" />
                    <a href="/events" className="link">Find an event</a>
                    <p>Sniff out events that bring together paws and people for endless fun.</p>
                </div>
                <div className="column">
                    <img src="../../images/img.png" alt="Icon" className="small-icon" />
                    <a href="/events" className="link">Start a new group</a>
                    <p>Gather furr-ends and create your own MeetPup group to share adventures with</p>
                </div>
            </section>

            {!currentUser && ( // conditionally render the section4 based on user login status
                <section className="section4">
                    <OpenModalButton
                        buttonText="Join MeetPup"
                        modalComponent={<SignupFormModal />}
                        className="signup-button"
                    />
                </section>
            )}

            <section className="section5">
                <h2>Explore MeetPup Groups</h2>
                <div className="groups-container">
                    {groups.map(group => (
                        <GroupCard key={group.id} group={group} /> // display group cards
                    ))}
                </div>
                {error && <p className="error-message">{error}</p>}
            </section>
        </div>
    );
};

export default LandingPage;
