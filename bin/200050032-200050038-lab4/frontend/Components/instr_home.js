import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

const InstrHomePage=()=>{
    const navigate = useNavigate();
    const [fetch_status, setFetchStatus] = useState(false);
    const [logged_in, setLoggedIn] = useState(false);
    const [instr_id, setInstrId] = useState("");
    const [name, setName] = useState("");
    const [dept, setDept] = useState("");
    const [curr, SetCurr] = useState("");
    const [prev, SetPrev] = useState("");
    const [done, setDone] = useState(false);
    const [notFound, setNotFound] = useState(false);

    useEffect(()=>{
    const f=()=>{
        fetch('http://localhost:4000/instr_home/', {
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
                        if (response[0].status === "-3") setNotFound(true);
                        else if (response[0].status === "0"){
                            // retrieve instr details from response here
                            setInstrId(response[1][0].id);
                            setName(response[1][0].name);
                            setDept(response[1][0].dept_name);
                            SetCurr(response[2]);
                            SetPrev(response[3]);
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

    function curr_fun(){
        if (curr.length !== 0) return (
            <div>
            <h2 style={{textAlign: 'center'}}>Current Courses</h2>    
            <table style={{borderCollapse: 'collapse', width: '80%', margin: '0 auto'}}>
                <thead>
                    <tr style={{backgroundColor: '#e0c7c8'}}>
                    <th style={{border: '1px solid black', padding: '8px'}}>COURSE_ID</th>
                    <th style={{border: '1px solid black', padding: '8px'}}>COURSE_NAME</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(curr).map((k, i) => {
                        let n = curr[k]
                        let p = '/instr/course/'+n.course_id
                        return (
                            <tr style={{backgroundColor: '#f2f2f2'}}>
                                <td style={{border: '1px solid black', padding: '8px'}}><a href={p}>{n.course_id}</a></td>
                                <td style={{border: '1px solid black', padding: '8px'}}>{n.title}</td>
                            </tr>
                        )
                    }
                    )}
                </tbody>
            </table>
            </div>
        )
        else return (
            <div>
            <p style={{color: 'red', textAlign: 'center'}}>No Courses offered in Running Semester</p>
            </div>
        )
    }

    function prev_fun(){
        if (prev.length !== 0) return (
            <div>
                <h2 style={{textAlign: 'center'}}>Previous Courses</h2>
            <table style={{borderCollapse: 'collapse', width: '80%', margin: '0 auto'}}>
                <thead>
                    <tr style={{backgroundColor: '#e0c7c8'}}>
                    <th style={{border: '1px solid black', padding: '8px'}}>COURSE_ID</th>
                    <th style={{border: '1px solid black', padding: '8px'}}>COURSE_NAME</th>
                    <th style={{border: '1px solid black', padding: '8px'}}>SEMESTER</th>
                    <th style={{border: '1px solid black', padding: '8px'}}>YEAR</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(prev).map((k, i) => {
                        let n = prev[k]
                        let p = '/instr/course/'+n.course_id
                        return (
                            <tr style={{backgroundColor: '#f2f2f2'}}>
                                <td style={{border: '1px solid black', padding: '8px'}}><a href={p}>{n.course_id}</a></td>
                                <td style={{border: '1px solid black', padding: '8px'}}>{n.title}</td>
                                <td style={{border: '1px solid black', padding: '8px'}}>{n.semester}</td>
                                <td style={{border: '1px solid black', padding: '8px'}}>{n.year}</td>
                            </tr>
                        )
                    }
                    )}
                </tbody>
            </table>
            </div>
        )
        else return (
            <div>
                <h3 style={{textAlign: 'center'}}>No Previous Courses</h3>
            </div>
        )
    }
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
            <h1>Instructor Not Found</h1>
        </div>
    )
    else return (
        <div>
            <h1 style={{textAlign: 'center'}}>Instructor Home</h1>
            <table style={{borderCollapse: 'collapse', width: '80%', margin: '0 auto'}}>
                <tbody>
                <tr>
                    <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#e0c7c8'}}>ID</th>
                    <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2'}}>{instr_id}</th>
                </tr>
                <tr>
                    <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#e0c7c8'}}>NAME</th>
                    <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2'}}>{name}</th>
                </tr>
                <tr>
                    <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#e0c7c8'}}>DEPARTMENT</th>
                    <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2'}}>{dept}</th>
                </tr>
                </tbody>
            </table>
        {curr_fun()}
        {prev_fun()}
        </div>
    );
}

export default InstrHomePage;