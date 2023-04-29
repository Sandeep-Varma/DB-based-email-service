import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './styles.css'

const LoginUser = ()=>{
    const navigate = useNavigate();
    const [user_id, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [wrongpwd, setWrongPwd] = useState(false);
    const [wrongid, setWrongId] = useState(false);
    const [server_error, setServerError] = useState(false);
    
    const authenticate = (e)=>{
        e.preventDefault();
        if (user_id && password) {
            let userData = {
                user_id: user_id,
                password: password,
            }
            fetch('http://localhost:4000/login', {
                method: 'POST', 
                mode: 'cors',
                headers: {
                    'Content-Type':'application/json',
                    'Accept':'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(userData)
            })
            .then(response=>response.json())
            .then(response=>response[0])
            .then(
                (response)=>{
                    setWrongId(false);
                    setWrongPwd(false);
                    setServerError(false);
                    console.log("Login Status: "+response.status);
                    if (response.status.startsWith("err_")) setServerError(true);
                    else if (response.status === "id_not_found") setWrongId(true);
                    else if (response.status === "wrong_pwd") setWrongPwd(true);
                    else navigate("/home");
                }
            )
            .catch(
                (error)=>{
                    setServerError(true);
                    console.log(error);
                }
            );
        }
        else {
            alert("Please enter a user ID and password");
        }
    }
    function handleClick() {
      navigate("/signup");
    }

    return (
        <div className='container'>
            <h1 >Login</h1>
            <form>
              <label>User ID</label>
              <input
                type="text"
                value={user_id}
                onChange={e => setUserId(e.target.value)}
              />
              <label >Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              {wrongid && <p style={{color: "red"}}>User ID does not exist</p>}
              {wrongpwd && <p style={{color: "red"}}>Wrong password</p>}
              {server_error && <p style={{color: "red"}}>Server error</p>}
              <button type="submit" onClick={authenticate}>Login</button>
              <button onClick={handleClick} >Signup</button>
              
            </form>
          </div>
          
          

    );
}

export default LoginUser;