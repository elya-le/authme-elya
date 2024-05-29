import { useEffect, useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
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
    setIsButtonDisabled(!isValid);
  }, [credential, password]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    return dispatch(sessionActions.login({ credential, password }))
      .then(() => {
        closeModal();
        window.location.href = window.location.pathname; // hard refresh without hash fragment
      })
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        }
      });
  };

  const loginDemoUser = (e) => {
    e.preventDefault();
    const demoCredential = 'demo@user.io';
    const demoPassword = 'password';
    return dispatch(sessionActions.login({ credential: demoCredential, password: demoPassword }))
      .then(() => {
        closeModal();
        window.location.href = window.location.pathname; // hard refresh without hash fragment
      })
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        }
      });
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
        <a href='#' onClick={loginDemoUser} className='demo-user-link'>Demo User</a>
      </form>
    </div>
  );
}

export default LoginFormModal;
