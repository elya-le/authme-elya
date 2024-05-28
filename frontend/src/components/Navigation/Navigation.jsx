import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButtonMenu from './ProfileButtonMenu';
import OpenModalButton from '../OpenModalButton/OpenModalButton';
import LoginFormModal from '../LoginFormModal/LoginFormModal';
import SignupFormModal from '../SignupFormModal/SignupFormModal';
import './Navigation.css';

// path to your logo image in the public directory
const meetupLogo = '/images/meet-up-logo-3.png';



function Navigation({ isLoaded }) {
  const sessionUser = useSelector((state) => state.session.user);
  const sessionLinks = sessionUser ? (
    <div className='profile'>
      <NavLink to='/groups/new' className='start-new-group-link'> 
        Start a new group
      </NavLink>
      <ProfileButtonMenu user={sessionUser} />
    </div>
  ) : (
    <>
      <OpenModalButton
        buttonText='Log in'
        modalComponent={<LoginFormModal />}
        className='login-button'
      />
      <OpenModalButton
        buttonText='Sign up'
        modalComponent={<SignupFormModal />}
        className='signup-button'
      />
    </>
  );
  return (
    <nav className='navigation-bar'>
      <div className='logo'>
        <NavLink exact to="/">
          <img src={meetupLogo} alt='Meetup Logo' />
        </NavLink>
      </div>
      <div className='nav-links'>
        {isLoaded && sessionLinks}
      </div>
    </nav>
  );
}

export default Navigation;