import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";

const MailPage = ()=>{
    const navigate = useNavigate();
    const { box } = useParams();
    const [server_error, setServerError] = useState(false);
    const [logged_in, setLoggedIn] = useState(false);
    const [done, setDone] = useState(false);
    
    useEffect(()=>{
        const f=async()=>{
            fetch('http://localhost:4000/mail/'+box, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
            })
            .then(response=>response.json())
            .then(
                async (response)=>{
                    console.log(response)
                    if (response[0][0].status === "not_logged_in") navigate("/login");
                    else setLoggedIn(true);
                    if (response[0][0].status.startsWith("err_")) setServerError(true);
                    else if (response[0][0].status === "invalid_box") navigate("/mail/inbox");
                    else {
                        
                    }
                    setDone(true)
                }
            )
            .catch((error)=>{console.log(error);});
        }
        f();
    },[navigate, box]);
    
    if (!done) return (
        <div>
            <h1>Loading ...</h1>
        </div>
    )
    else if (server_error) return (
        <div>
            <h1>Server Error</h1>
        </div>
    )
    else if (!logged_in){
        return (
            <div>
                <h1>Not logged in. Redirecting ...</h1>
            </div>
        )
    }
    else return (
        <div>
            <h1>Webpage in development</h1>
        </div>
    )
}

export default MailPage;