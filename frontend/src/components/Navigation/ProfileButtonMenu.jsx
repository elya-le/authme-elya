import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { FaUserCircle } from 'react-icons/fa';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa'; // import arrow icons
import * as sessionActions from '../../store/session';
import './ProfileButtonMenu.css';

function ProfileButtonMenu ({ user }) {
    const dispatch = useDispatch();
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
        dispatch(sessionActions.logout());
    };

    return (
        <div className="profile-button-container">
            <button onClick={toggleMenu} className="profile-icon">
                {user.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="profile" className="profile-image" />
                ) : (
                    <FaUserCircle className="default-icon" />
                )}
                {arrowDirection === 'down' ? <FaAngleDown /> : <FaAngleUp />}
            </button>
            <ul className={`profile-dropdown ${showMenu ? "" : "hidden"}`} ref={ulRef}>
                <li>{user.username}</li>
                <hr />
                <li>
                    <button onClick={logout}>Log Out</button>
                </li>
            </ul>
        </div>
    );
}

export default ProfileButtonMenu;