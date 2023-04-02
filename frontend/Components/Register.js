import React, { useState } from 'react';


const Register = (props) => {
    // declare all the required states
    const [studentid, setStudentid] = useState('');
    const [password, setPassword] = useState('');
    const [confirmpassword, setConfirmpassword] = useState('');
    const [error, setError] = useState('');
    // check if all the fields are filled
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!studentid || !password || !confirmpassword) {
            setError('Please enter all fields');
            return;
        }
        // check if the passwords match
        if (password !== confirmpassword) {
            setError('Passwords do not match');
            return;
        }
        // send the data to the backend
        try {
            const response = await fetch('http://localhost:4000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentid, password }),
            });
            const data = await response.json();
            console.log(data);
            if (data.status === 'success') {
                // pop up a message
                alert('Registered successfully');
                alert('Please login to continue');
                window.location.href = '/login';
            } else {
                setError(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <div className="register-container">
            <div className="register-form">
                <h1>Register</h1>
                {error && <p>{error}</p>}
                <form class="inner-form" onSubmit={handleSubmit}>
                    <input

                        type="text"
                        placeholder="Student id"
                        value={studentid}
                        onChange={(e) => setStudentid(e.target.value)}
                    />
                    <input

                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input
                    type = "password"
                    placeholder = "Confirm Password"
                    value = {confirmpassword}
                    onChange = {(e) => setConfirmpassword(e.target.value)}
                    />
                    <button class="submit-btn" type="submit">Register</button>
                </form>
            </div>
        </div>
    );
};
