import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

const AllDeptsPage=()=>{
    const navigate = useNavigate();
    const [fetch_status, setFetchStatus] = useState(false);
    const [done, setDone] = useState(false);
    const [data, setData] = useState([]);
    const [logged_in, setLoggedIn] = useState(false);

    useEffect(()=>{
    const f=()=>{
        fetch('http://localhost:4000/all_depts', {
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
        })
        .then(response=>response.json())
        .then(
            async (response)=>{
                // console.log(response);
                if (!(response[0].status === "-2")){
                    setFetchStatus(true)
                    if (response[0].status === "-1") navigate("/login");
                    else{
                        setLoggedIn(true);
                        if (response[0].status === "0"){
                            // retrieve data from response here
                            var d = []
                            for (let i=1; i<response.length; i++){
                                d.push(response[i])
                            }
                            setData(d)
                        }
                        else setFetchStatus(false);
                    }
                }
                setDone(true)
            }
        )
    }
    f()
    }, [navigate]);
    
    if (!done) return (
        <div><h1>Loading...</h1></div>
    )
    else if (!fetch_status) return (
        <div>
            <h1>Server Error</h1>
        </div>
    )
    else if (!logged_in) return (
        <div>
            <h1>Not logged in</h1>
        </div>
    )
    else return (
        <div>
            <h2 style={{textAlign: 'center'}}>All Departments</h2>
            <table style={{borderCollapse: 'collapse', width: '80%', margin: '0 auto'}}>
                <thead>
                    <tr style={{backgroundColor: '#e0c7c8'}}>
                    <th style={{border: '1px solid black', padding: '8px'}}>Department</th>
                    <th style={{border: '1px solid black', padding: '8px'}}>Building</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(data).map((k, i) => {
                        let n = data[k]
                        let j = "/all_dept_courses/" + n.dept_name
                        return (
                            <tr style={{backgroundColor: '#f2f2f2'}}>
                                <td style={{border: '1px solid black', padding: '8px'}}><a href = {j}>{n.dept_name}</a></td>
                                <td style={{border: '1px solid black', padding: '8px'}}>{n.building}</td>
                            </tr>
                        )
                    }
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default AllDeptsPage;