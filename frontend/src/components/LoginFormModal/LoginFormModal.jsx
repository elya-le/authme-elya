import { useEffect, useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import { fetchWithCsrf } from '../../utils/fetchWithCsrf'; // Correct import path
import './LoginFormModal.css';

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const { closeModal } = useModal();

  useEffect(() => {
    const isValid = credential.length >= 4 && password.length >= 6; 
    setIsButtonDisabled(!isValid); // disable button if invalid
  }, [credential, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // clear previous errors
    try {
      const response = await fetchWithCsrf('/api/session', {
        method: 'POST',
        body: JSON.stringify({ credential, password })
      });
      if (response.user) {
        dispatch(sessionActions.setSession(response.user));
        closeModal(); // close modal on successful login
        window.location.href = window.location.pathname; // hard refresh without hash fragment
      } else if (response.errors) {
        setErrors(response.errors); // set errors from response
      }
    } catch (error) {
      setErrors({ message: 'The provided credentials were invalid' }); // set custom error message
    }
  };

  const loginDemoUser = async (e) => {
    e.preventDefault();
    const demoCredential = 'demo@user.io';
    const demoPassword = 'password';
    try {
      const response = await fetchWithCsrf('/api/session', {
        method: 'POST',
        body: JSON.stringify({ credential: demoCredential, password: demoPassword })
      });
      if (response.user) {
        dispatch(sessionActions.setSession(response.user));
        closeModal();
        window.location.href = window.location.pathname; // hard refresh without hash fragment
      } else if (response.errors) {
        setErrors(response.errors);
      }
    } catch (error) {
      setErrors({ message: 'The provided credentials were invalid' });
    }
  };

  return (
    <div className='login-form'>
      <button className='close-button' onClick={closeModal}>&times;</button>
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username or email
          <input
            type='text'
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </label>
        {errors.credential && <p className='error'>{errors.credential}</p>}
        <label>
          Password
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.password && <p className='error'>{errors.password}</p>}
        {errors.message && <p className='error'>{errors.message}</p>}
        <button type='submit' disabled={isButtonDisabled}>Log In</button>
        <a href='#' onClick={loginDemoUser} className='demo-user-link'>Log in as Demo User</a>
      </form>
    </div>
  );
}

export default LoginFormModal;
