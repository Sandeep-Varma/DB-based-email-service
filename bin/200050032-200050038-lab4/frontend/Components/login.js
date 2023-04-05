import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const LoginUser = ()=>{
    const navigate = useNavigate();
    const [user_id, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [wrongpwd, setWrongPwd] = useState(false);
    const [wrongid, setWrongId] = useState(false);
    const [norole, setNoRole] = useState(false);
    
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
            .then(
                (response)=>{
                    setNoRole(false);
                    setWrongId(false);
                    setWrongPwd(false);
                    // console.log("Login Status: "+response.login_status);
                    if (response.login_status === "0"){
                      if (response.role === "s") navigate("/home");
                      else if (response.role === "i") navigate("/instr/home");
                    }
                    else if (response.login_status === "-2") setWrongId(true);
                    else if (response.login_status === "-1") setWrongPwd(true);
                    else if (response.login_status === "-7") setNoRole(true);
                    else alert("Server error "+response.login_status)
                }
            )
            .catch(
                (error)=>{
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
              {norole && <p style={{color: "red"}}>Not a student or instructor</p>}
              {wrongid && <p style={{color: "red"}}>User ID does not exist</p>}
              {wrongpwd && <p style={{color: "red"}}>Wrong password</p>}
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