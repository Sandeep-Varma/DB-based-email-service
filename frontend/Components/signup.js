import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

function SignUp() {
    const navigate = useNavigate();
    const [user_id, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirm_password, setConfirmPassword] = useState("");
    const [idexists, setIdExists] = useState(false);
    const [server_error, setServerError] = useState(false);
    
    function call_post(e) {
        e.preventDefault();
        // console.log("call_post");
        if (user_id && password && confirm_password && password === confirm_password) {
            let userData = {
                user_id: user_id,
                password: password,
                name: name,
            }
            // console.log(JSON.stringify(userData))
            fetch('http://localhost:4000/signup', {  // Enter your IP address here
                method: 'POST', 
                mode: 'cors',
                headers: {
                    'Content-Type':'application/json',
                    'Accept':'application/json'
                },
                body: JSON.stringify(userData) // body data type must match "Content-Type" header
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
                    else navigate("/home"); 
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

    return (
        <div>
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
                <button type="submit" onClick={call_post}>Create User</button>
            </form>
        </div>
    );
}

export default SignUp;