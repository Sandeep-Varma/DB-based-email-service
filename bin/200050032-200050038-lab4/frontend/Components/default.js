import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

const DefaultRedirector = ()=>{
    const navigate = useNavigate();
    
    useEffect(()=>{
        // console.log("Redirecting")
        fetch('http://localhost:4000/check_login', {
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
        })
        .then(response=>response.json())
        .then(
            async (response)=>{
                // console.log(response)
                if (response[0].status === "-1") navigate("/login");
                else if (response[0].role === "i") navigate("/instr/home");
                else navigate("/home");
            }
        )
    }, [navigate]);

    return (
        <div>
            <h1>Redirecting..</h1>
        </div>
    );
}

export default DefaultRedirector;