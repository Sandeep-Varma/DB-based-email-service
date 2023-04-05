import React, { useState } from 'react';
const Login = (props) => {
    const [studentid, setStudentid] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!studentid || !password) {
            setError('Please enter all fields');
            return;
        }
        try {
            const response = await fetch(`http://localhost:4000/login?studentid=${studentid}&password=${password}`,{
                method: 'GET',       
                credentials: 'include',       
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': true,},
        });
            const data = await response.json();
            console.log(data);
            if(data.status === 'failure'){
                setError(data.message);
                return;
            }
            if (data.status === 'success') {
                window.location.href = '/home';
            } else {
                setError(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <div className="login-container">
            <div className="login-form">
                <h1>Login</h1>
                {error && <p>{error}</p>}
                <form class = "inner-form" onSubmit={handleSubmit}>
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
                    <button class = "submit-btn" type="submit">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
