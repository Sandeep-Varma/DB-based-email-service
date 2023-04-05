import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

const AllStudentsPage=()=>{
    const navigate = useNavigate();
    const [fetch_status, setFetchStatus] = useState(false);
    const [logged_in, setLoggedIn] = useState(false);
    const [data, setData] = useState([]);
    const [done, setDone] = useState(false);

    useEffect(()=>{
    const f=async()=>{
        fetch('http://localhost:4000/all_students', {
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
                    else if (response[0].status === "-9") navigate("/home");
                    else{
                        setLoggedIn(true);
                        // if (response[0].status === "-3") setNotFound(true);
                        if (response[0].status === "0"){
                            // retrieve course details from response here
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
            <h2 style={{textAlign: 'center'}}>All Students</h2>
            <table style={{borderCollapse: 'collapse', width: '80%', margin: '0 auto'}}>
                <thead>
                    <tr style={{backgroundColor: '#e0c7c8'}}>
                    <th style={{border: '1px solid black', padding: '8px'}}>Student ID</th>
                    <th style={{border: '1px solid black', padding: '8px'}}>Student Name</th>
                    <th style={{border: '1px solid black', padding: '8px'}}>Department</th>
                    <th style={{border: '1px solid black', padding: '8px'}}>Total Credits</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(data).map((k, i) => {
                        let n = data[k]
                        let j = "/student/"+n.id
                        return (
                            <tr style={{backgroundColor: '#f2f2f2'}}>
                                <td style={{border: '1px solid black', padding: '8px'}}><a href = {j}>{n.id}</a></td>
                                <td style={{border: '1px solid black', padding: '8px'}}>{n.name}</td>
                                <td style={{border: '1px solid black', padding: '8px'}}>{n.dept_name}</td>
                                <td style={{border: '1px solid black', padding: '8px'}}>{n.tot_cred}</td>
                            </tr>
                        )
                    }
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default AllStudentsPage;