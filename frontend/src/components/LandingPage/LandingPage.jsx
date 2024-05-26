import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SignupFormModal from '../SignupFormModal/SignupFormModal';
import OpenModalButton from '../OpenModalButton/OpenModalButton';
import GroupCard from '../Groups/GroupCard';
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
        <div className='landing-page'>
            <section className="section1">
                <div className='title'>
                    <h1>Welcome to MeetPup</h1><br></br>
                    <p className='intro-text'>Whatever your adventure, from city strolls and beach romps to playful pup events, there are thousands of furry friends waiting to connect on MeetPup. PAW-some activities are happening daily.</p>
                </div>
                <div className="infographic">
                    <img src="../../images/lp-infographic1.png" alt="Infographic" />
                </div>
            </section>

            <section className="section2">
                <h2>How MeetPup Works</h2><br></br>
                <p>Join a group, attend an event, or start your own... The fun awaits!</p>
            </section>

            <section className="section3">
                <Link to="/groups" className="section3-link">
                    <div className="column">
                        <img src="../../images/img.png" alt="Icon" className="small-icon" />
                        <a href="/events" className="section3-group-link">See all groups</a>
                        <p>Find your pack among our groups. MeetPup has a community for every breed, age, and size!</p>
                    </div>
                </Link>
                <Link to="/events" className="section3-link">
                    <div className="column">
                        <img src="../../images/img.png" alt="Icon" className="small-icon" />
                        <a href="/groups" className="section3-event-link">Find an event</a>
                        <p>Sniff out events that bring together paws and people for endless fun. MeetPup makes it easy to connect, socialize, and share experiences with your local dog community.</p>
                    </div>
                </Link>
                {currentUser ? (
                    <Link to="/groups" className="section3-link">
                        <div className="column">
                            <img src="../../images/img.png" alt="Icon" className="small-icon" />
                            <a href="/groups" className="section3-start-link-enabled">Start a new group</a>
                            <p>If you havent find what you&apos;re looking for yet... create your own MeetPup group and watch as pups come wagging to join your adventures!</p>
                        </div>
                    </Link>
                ) : (
                    <div className="column-disabled">
                        <img src="../../images/img.png" alt="Icon" className="small-icon" />
                        <a href="/groups" className="section3-start-link-disabled">Start a new group</a>
                        <p>Gather furr-ends and create your own MeetPup group to share adventures with</p>
                    </div>
                )}
                
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
                <h2 className='explore-header'>Explore MeetPup Groups</h2><br></br>
                <div className='explore-groups-container'>
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
