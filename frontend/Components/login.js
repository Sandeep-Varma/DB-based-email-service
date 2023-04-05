import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

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
            fetch('http://localhost:4000/login', {  // Enter your IP address here
                method: 'POST', 
                mode: 'cors',
                headers: {
                    'Content-Type':'application/json',
                    'Accept':'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(userData) // body data type must match "Content-Type" header
            })
            .then(response=>response.json())
            .then(response=>response[0])
            .then(
                (response)=>{
                    setWrongId(false);
                    setWrongPwd(false);
                    setServerError(false);
                    // console.log("Login Status: "+response.status);
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

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "50px",
            // backgroundColor: '#530E2D'
          }}>
            <h1 style={{fontSize: "36px", marginBottom: "30px", color: "#333"}}>Login</h1>
            <form style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "300px",
              backgroundColor: "#84c3bd",
              borderRadius: "10px",
              padding: "50px",
              boxShadow: "0 0 10px #888888"
            }}>
              <label style={{fontSize: "18px", marginBottom: "10px", color: "#333"}}>User ID</label>
              <input
                type="text"
                value={user_id}
                onChange={e => setUserId(e.target.value)}
                style={{
                  fontSize: "18px",
                  padding: "10px",
                  marginBottom: "20px",
                  borderRadius: "5px",
                  border: "none",
                  boxShadow: "0 0 5px #888888",
                  width: "100%"
                }}
              />
              <label style={{fontSize: "18px", marginBottom: "10px", color: "#333"}}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  fontSize: "18px",
                  padding: "10px",
                  marginBottom: "20px",
                  borderRadius: "5px",
                  border: "none",
                  boxShadow: "0 0 5px #888888",
                  width: "100%"
                }}
              />
              {wrongid && <p style={{color: "red"}}>User ID does not exist</p>}
              {wrongpwd && <p style={{color: "red"}}>Wrong password</p>}
              {server_error && <p style={{color: "red"}}>Server error</p>}
              <button type="submit" onClick={authenticate} style={{
                fontSize: "18px",
                padding: "10px",
                marginTop: "20px",
                width: "100px",
                backgroundColor: "#333",
                color: "#ffffff",
                borderRadius: "5px",
                border: "none",
                boxShadow: "0 0 5px #888888"
              }}>Login</button>
            </form>
          </div>
          
          

    );
}

export default LoginUser;