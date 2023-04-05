import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";

const DeptCoursePage=()=>{
    const navigate = useNavigate();
    const { dept_name } = useParams();
    const [fetch_status, setFetchStatus] = useState(false);
    const [logged_in, setLoggedIn] = useState(false);
    const [data, setData] = useState([]);
    const [done, setDone] = useState(false);
    const [notFound, setNotFound] = useState(false);

    useEffect(()=>{
    const f=async()=>{
        fetch('http://localhost:4000/dept_courses/'+dept_name, {
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
                        if (response[0].status === "-3") setNotFound(true);
                        else if (response[0].status === "0"){
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
    }, [dept_name, navigate]);
    
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
    else if (notFound) return (
        <div>
            <h1>Department Not Found</h1>
        </div>
    )
    else return (
        <div>
            <h2 style={{textAlign: 'center'}}>Running Courses of {dept_name}</h2>
            <table style={{borderCollapse: 'collapse', width: '80%', margin: '0 auto'}}>
                <thead>
                    <tr style={{backgroundColor: '#e0c7c8'}}>
                    <th style={{border: '1px solid black', padding: '8px'}}>Course ID</th>
                    <th style={{border: '1px solid black', padding: '8px'}}>Course Name</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(data).map((k, i) => {
                        let n = data[k]
                        let j = "/instr/course/"+n.course_id
                        return (
                            <tr style={{backgroundColor: '#f2f2f2'}}>
                                <td style={{border: '1px solid black', padding: '8px'}}><a href = {j}>{n.course_id}</a></td>
                                <td style={{border: '1px solid black', padding: '8px'}}>{n.title}</td>
                            </tr>
                        )
                    }
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default DeptCoursePage;