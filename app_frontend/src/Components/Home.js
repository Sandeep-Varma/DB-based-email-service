//write a home page, that will just say hi

import React from 'react';
// import { Link } from 'react-router-dom';
const Home = () => {
    return (
        <div>
            <h1>Hi</h1>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
        </div>
    );
}