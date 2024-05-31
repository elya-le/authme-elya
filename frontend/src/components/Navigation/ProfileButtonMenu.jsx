import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom'; // import useNavigate for navigation
import { FaUserCircle, FaAngleDown, FaAngleUp } from 'react-icons/fa'; 
import * as sessionActions from '../../store/session';
import './ProfileButtonMenu.css';

function ProfileButtonMenu({ user }) {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // initialize useNavigate for navigation
  const [showMenu, setShowMenu] = useState(false);
  const [arrowDirection, setArrowDirection] = useState('down'); // state for arrow direction
  const ulRef = useRef();

  const toggleMenu = (e) => {
    e.stopPropagation(); // keep click from bubbling up to document and triggering closeMenu
    setShowMenu(!showMenu);
    setArrowDirection(showMenu ? 'down' : 'up'); // toggle arrow direction
  };

  useEffect(() => {
    if (!showMenu) return;
    const closeMenu = (e) => {
      if (ulRef.current && !ulRef.current.contains(e.target)) {
        setShowMenu(false);
        setArrowDirection('down'); // reset arrow direction when menu closes
      }
    };
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, [showMenu]);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout())
      .then(() => {
        navigate('/'); // navigate to home page on logout
        window.location.reload(true); // hard refresh without cache
      });
  };

  return (
    <div className='profile-button-container'>
      <button onClick={toggleMenu} className='profile-icon'>
        {user.profileImageUrl ? (
          <img src={user.profileImageUrl} alt='profile' className='profile-image' />
        ) : (
          <FaUserCircle className='default-icon' />
        )}
        {arrowDirection === 'down' ? <FaAngleDown /> : <FaAngleUp />}
      </button>
      <ul className={`profile-dropdown ${showMenu ? "" : 'hidden'}`} ref={ulRef}>
        <li>Hello, {user.username}<br></br><br></br>
        {user.email}
        </li>
        <hr />
        <li>
          <Link to='/groups' className='dropdown-link' onClick={() => setShowMenu(false)}>View groups</Link>
        </li>
        <li>
          <Link to='/events' className='dropdown-link' onClick={() => setShowMenu(false)}>View events</Link>
        </li>
        <hr />
        <li>
          <button onClick={logout}>Log Out</button>
        </li>
      </ul>
    </div>
  );
}

export default ProfileButtonMenu;
