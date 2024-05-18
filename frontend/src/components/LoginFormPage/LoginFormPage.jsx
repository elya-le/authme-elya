import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../../store/session';

const LoginFormPage = () => {
    const dispatch = useDispatch();
    const [credential, setCredential] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(login({ credential, password }));
    };

    return (
        <form onSubmit={handleSubmit}>
        <label>
            Username or Email
        <input
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
        />
        </label>
        <label>
            Password
        <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
        />
        </label>
        <button type="submit">Log In</button>
    </form>
    );
};

export default LoginFormPage;
