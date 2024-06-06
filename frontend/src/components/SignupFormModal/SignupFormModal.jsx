import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import * as sessionActions from '../../store/session';
import './SignupFormModal.css';

function SignupFormModal() {
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    const isValid = email && username.length >= 4 && password.length >= 6 && firstName && lastName && confirmPassword;
    setIsButtonDisabled(!isValid); // disable button if invalid
  }, [email, username, password, firstName, lastName, confirmPassword]);

  const resetForm = () => {
    setEmail(''); 
    setUsername(''); 
    setFirstName(''); 
    setLastName(''); 
    setPassword(''); 
    setConfirmPassword(''); 
    setErrors({}); // clear errors
    setIsButtonDisabled(true); // disable button on reset
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setErrors({ email: 'The provided email is invalid' });
      return;
    }
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Confirm Password field must be the same as the Password field' }); // set password mismatch error
      return;
    }
    setErrors({}); // clear errors
    return dispatch(sessionActions.signup({ email, username, firstName, lastName, password }))
      .then(() => {
        closeModal(); // close modal on successful signup
        resetForm(); // reset form
      })
      .catch(async (res) => {
        const data = await res.json();
        if (data?.errors) setErrors(data.errors); // set errors from response
      });
  };

  const loginDemoUser = async (e) => {
    e.preventDefault();
    const demoCredential = 'demo@user.io';
    const demoPassword = 'password';
    return dispatch(sessionActions.login({ credential: demoCredential, password: demoPassword }))
      .then(() => {
        closeModal(); // close modal on successful login
        window.location.href = window.location.pathname; // hard refresh without hash fragment
      })
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors); // set errors from response
        }
      });
  };

  return (
    <div className='signup-form'>
      <button className='close-button' onClick={() => { closeModal(); resetForm(); }}>&times;</button> {/* close modal and reset form */}
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        {errors.firstName && <p className='error'>{errors.firstName}</p>} 
        <label>
          First Name
          <input
            type='text'
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </label>
        {errors.lastName && <p className='error'>{errors.lastName}</p>} 
        <label>
          Last Name
          <input
            type='text'
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </label>
        {errors.username && <p className='error'>{errors.username}</p>} 
        <label>
          Username
          <input
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        {errors.email && <p className='error'>{errors.email}</p>} 
        <label>
          Email
          <input
            type='text'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        {errors.password && <p className='error'>{errors.password}</p>} 
        {errors.confirmPassword && <p className='error'>{errors.confirmPassword}</p>} 
        <label>
          Password
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label>
          Confirm Password
          <input
            type='password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        <button type='submit' disabled={isButtonDisabled} className={isButtonDisabled ? 'disabled-button' : ''}>Sign Up</button> 
        <a href='#' onClick={loginDemoUser} className='demo-user-link'>Log in as Demo User</a>
        {errors.message && <p className='error'>{errors.message}</p>} 
      </form>
    </div>
  );
}

export default SignupFormModal;
