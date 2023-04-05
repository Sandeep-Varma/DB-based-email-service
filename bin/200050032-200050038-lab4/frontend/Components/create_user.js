import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

function CreateUser() {
    const navigate = useNavigate();
    const [user_id, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [confirm_password, setConfirmPassword] = useState("");
    
    function call_post(e) {
        e.preventDefault();
        // console.log("call_post");
        if (user_id && password && confirm_password && password === confirm_password) {
            let userData = {
                user_id: user_id,
                password: password
            }
            // console.log(JSON.stringify(userData))
            fetch('http://localhost:4000/insert_user', {  // Enter your IP address here
                method: 'POST', 
                mode: 'cors',
                headers: {
                    'Content-Type':'application/json',
                    'Accept':'application/json'
                },
                body: JSON.stringify(userData) // body data type must match "Content-Type" header
            })
            .then(response=>response.text())
            .then(
                // display success message
                (response)=>{
                    if (response === "0"){
                        alert("User created successfully");
                        navigate("/home");
                    }
                    else alert("User creation failed");
                }
            )
            .catch(
                (error)=>{
                    // console.log(error);
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
                <button type="submit" onClick={call_post}>Create User</button>
            </form>
        </div>
    );
}

export default CreateUser;