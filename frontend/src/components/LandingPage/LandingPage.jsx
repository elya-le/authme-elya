import SignupFormModal from '../SignupFormModal/SignupFormModal';
import OpenModalButton from '../OpenModalButton/OpenModalButton';
import './LandingPage.css'; // import the CSS file

const LandingPage = () => {
    return (
        <div className="landing-page">
            <section className="section1">
                <div className="text">
                    <h1>Welcome to MeetPup</h1>
                    <p>Where tails wag and friendships blossom</p>
                    <p className="intro-text">Fetch your leash and join our paw-some community! Whether you&apos;re into city strolls, beach romps, or playful events, Meet Pup is the ulti-mutt place for you and your furry pal.</p>
                </div>
                <div className="infographic">
                    <img src="../../images/lp-infographic1.png" alt="Infographic" /> {/* update the path to your infographic */}
                </div>
            </section>

            <section className="section2">
                <h2>How MeetPup works</h2>
                <p>Unleash the fun with events and groups for every pup</p>
            </section>

            <section className="section3">
                <div className="column">
                    <div className="icon"></div> {/* replace with actual icon */}
                    <a href="/groups" className="link">See all groups</a>
                    <p>Sniff out groups like Urban Trailblazers, Beachfront Barks, and more</p>
                </div>
                <div className="column">
                    <div className="icon"></div> {/* replace with actual icon */}
                    <a href="/events" className="link">Find an event</a>
                    <p>Pounce on events like Low Rider Limbo, Brush Your Chow Day, and more</p>
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
        </div>
    );
};

export default LandingPage;
