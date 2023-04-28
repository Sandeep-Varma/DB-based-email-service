import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import './styles.css'

function SignUp() {
    const navigate = useNavigate();
    const [user_id, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirm_password, setConfirmPassword] = useState("");
    const [idexists, setIdExists] = useState(false);
    const [server_error, setServerError] = useState(false);
    // const [isSignUpSuccessful, setIsSignUpSuccessful] = useState(false);
    
    
    function call_post(e) {
        e.preventDefault();
        // if(password !== confirm_password) {
        //     alert("Password doesn't match");
        //     return;
        // }
        if (user_id && password && confirm_password && password === confirm_password) {
            let userData = {
                user_id: user_id,
                password: password,
                name: name,
            }
            fetch('http://localhost:4000/signup', {
                method: 'POST', 
                mode: 'cors',
                headers: {
                    'Content-Type':'application/json',
                    'Accept':'application/json'
                },
                body: JSON.stringify(userData)
            })
            .then(response=>response.json())
            .then(response=>response[0])
            .then(
                // display success message
                (response)=>{
                    setServerError(false);
                    setIdExists(false);
                    if (response.status.startsWith("err_")) setServerError(true);
                    else if (response.status === "id_already_exists") setIdExists(true);
                    else {
                        alert("Sign up successful! Redirecting to login page...")
                        navigate("/home");}
                    // else setIsSignUpSuccessful(true); 
                }
            )
            .catch(
                (error)=>{
                    // console.log(error);
                    setServerError(true);
                }
            );

        }
        else {
            alert("Please enter a user ID and same password and confirm password");
        }
    }
    function handleClick() {
        navigate("/login");
      }

    // function handleNavigateHome() {
    //     navigate("/home");
    // }
    // useEffect(() => {
    //     if(isSignUpSuccessful) {
    //         const timer = setTimeout(() => {
    //             navigate("/login");
    //             }, 3000);
    //         return () => clearTimeout(timer);
    //     }
        

    return (
        <div className='container'>
            <h1>Create User</h1>
            <form>
                <label>User ID</label>
                <input
                    type="text"
                    value={user_id}
                    onChange={e=>setUserId(e.target.value)}
                />
                <br />
                <label>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={e=>setPassword(e.target.value)}
                />
                <br />
                <label>Confirm Password</label>
                <input
                    type="password"
                    value={confirm_password}
                    onChange={e=>setConfirmPassword(e.target.value)}
                />
                <br />
                <label>Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={e=>setName(e.target.value)}
                />
                <br />
                {idexists && <p style={{color: "red"}}>ID already taken</p>}
                {server_error && <p style={{color: "red"}}>Server error</p>}
                <button type="submit" onClick={call_post}>Sign up</button>
                {/* {isSignUpSuccessful && 
                <div>
                    <p style={{color: "green"}}>Sign up successful!</p>
                    <button onClick={handleNavigateHome}> Go to Home </button>
                    </div>} */}
                <button onClick={handleClick} >Login</button>
            </form>
        </div>
    );
}

export default SignUp;