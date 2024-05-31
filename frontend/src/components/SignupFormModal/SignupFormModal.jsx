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
    setEmail(''); // reset email
    setUsername(''); // reset username
    setFirstName(''); // reset first name
    setLastName(''); // reset last name
    setPassword(''); // reset password
    setConfirmPassword(''); // reset confirm password
    setErrors({}); // clear errors
    setIsButtonDisabled(true); // disable button on reset
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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

  const loginDemoUser = (e) => {
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
        } else {
          setErrors({ message: "The provided credentials were invalid" }); // set custom error message
        }
      });
  };

  return (
    <div className='signup-form'>
      <button className='close-button' onClick={() => { closeModal(); resetForm(); }}>&times;</button> {/* close modal and reset form */}
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <label>
          First Name
          <input
            type='text'
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </label>
        {errors.firstName && <p className='error'>{errors.firstName}</p>} {/* display first name errors */}
        <label>
          Last Name
          <input
            type='text'
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </label>
        {errors.lastName && <p className='error'>{errors.lastName}</p>} {/* display last name errors */}
        <label>
          Username
          <input
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        {errors.username && <p className='error'>{errors.username}</p>} {/* display username errors */}
        <label>
          Email
          <input
            type='text'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        {errors.email && <p className='error'>{errors.email}</p>} {/* display email errors */}
        <label>
          Password
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.password && <p className='error'>{errors.password}</p>} {/* display password errors */}
        <label>
          Confirm Password
          <input
            type='password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        {errors.confirmPassword && <p className='error'>{errors.confirmPassword}</p>} {/* display confirm password errors */}
        <button type='submit' disabled={isButtonDisabled} className={isButtonDisabled ? 'disabled-button' : ''}>Sign Up</button> {/* submit button */}
        <a href='#' onClick={loginDemoUser} className='demo-user-link'>Demo User</a> {/* demo user link */}
        {errors.message && <p className='error'>{errors.message}</p>} {/* display general errors */}
      </form>
    </div>
  );
}

export default SignupFormModal;

