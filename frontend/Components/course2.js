import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";

const CoursePage=()=>{
    const navigate = useNavigate();
    const { course_id } = useParams();
    const [course_name, setCourseName] = useState("");
    const [credits, setCredits] = useState(0);
    const [dept, setDept] = useState("");
    const [pre_reqs, setPreReqs] = useState([]);
    const [sections, setSections] = useState([]);
    const [prev,setPrev] = useState([]);
    const [fetch_status, setFetchStatus] = useState(false);
    const [logged_in, setLoggedIn] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(()=>{
    const f=async()=>{
        fetch('http://localhost:4000/course/'+course_id, {
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
        })
        .then(response=>response.json())
        .then(
            async (response)=>{
                // console.log("Hello from course page");
                // console.log(response);
                if (!(response[0].status === "-2")){
                    setFetchStatus(true)
                    if (response[0].status === "-1") navigate("/login");
                    else{
                        setLoggedIn(true);
                        if (response[0].status === "-3") setNotFound(true);
                        else if (response[0].status === "0"){
                            // retrieve course details from response here
                            // present offerings (print "current semester offering") and past offerings (print "Not offered this semester")
                            // console.log(response[1][0])
                            setCourseName(response[4][0].title)
                            setCredits(response[4][0].credits)
                            setDept(response[4][0].dept_name)
                            setPreReqs(response[3])
                            setSections(response[1])
                            setPrev(response[2])
                            // console.log(Object.keys(pre_reqs).length)
                            // console.log(response[1],sections)
                        }
                        else setFetchStatus(false);
                    }
                }
                setDone(true)
            }
        )
    }
    f()
    }, [course_id, navigate]);

    // useEffect(()=>{
    //     console.log(sections)
    // },[sections])
    
    function prereq_fun() {
        if(Object.keys(pre_reqs).length===0)return (
            <div>
            <h2 style={{textAlign: 'center'}}>Prerequisites</h2>
            <p style={{textAlign: 'center'}}>None</p>
            </div>
        )
        else return(
            <div>
            <h2 style={{textAlign: 'center'}}>Prerequisites</h2>
            <table style={{borderCollapse: 'collapse', width: '80%', margin:'0 auto'}}>
                <thead>
                    <tr style={{backgroundColor: '#e0c7c8'}}>
                    <th style={{border: '1px solid black', padding: '8px'}}>COURSE_ID</th>
                    <th style={{border: '1px solid black', padding: '8px'}}>COURSE_NAME</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(pre_reqs).map((k, i) => {
                        let n = pre_reqs[k]
                        let p = "/instr/course/"+n.prereq_id
                        return (
                            <tr style={{backgroundColor: '#f2f2f2'}}>
                                <td style={{border: '1px solid black', padding: '8px'}}><a href = {p}>{n.prereq_id}</a></td>
                                <td style={{border: '1px solid black', padding: '8px'}}>{n.title}</td>
                            </tr>
                        )
                    }
                    )}
                </tbody>
            </table>
            </div>
        )
    }

    function curr_off() {
        if (sections.length!==0) return(
            <div>
            {Object.keys(sections).map((k, i) => {
                let n = sections[k]
                return (
                    <div>
                        <h2 style={{textAlign: 'center'}}>Current Offerings - {n.semester} {n.year}</h2>
                        <table style={{borderCollapse: 'collapse', width: '80%', margin: '0 auto'}}>
                            <thead>
                                <tr style={{backgroundColor: '#e0c7c8'}}>
                                <th style={{border: '1px solid black', padding: '8px'}}>SECTION_ID</th>
                                <th style={{border: '1px solid black', padding: '8px'}}>INSTRUCTORS</th>
                                <th style={{border: '1px solid black', padding: '8px'}}>VENUE</th>
                                <th style={{border: '1px solid black', padding: '8px'}}>TIME_SLOT</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{backgroundColor: '#f2f2f2'}}>
                                    <td style={{border: '1px solid black', padding: '8px'}}>{n.sec_id}</td>
                                    <td style={{border: '1px solid black', padding: '8px'}}>{
                                        Object.keys(n.instrs).map((k, i) => {
                                            let m = n.instrs[k]
                                            let f = '/instr/instructor/'+m.id
                                            return (
                                                <div>
                                                <a href={f}>{m.name}</a>
                                                </div>
                                            )
                                        }
                                        )
                                    }</td>
                                    <td style={{border: '1px solid black', padding: '8px'}}>{n.room_number}, {n.building}</td>
                                    <td style={{border: '1px solid black', padding: '8px'}}>{n.time_slot_id}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )
            })}
            </div>
        )
        else return(
            <div>
            <h3 style={{color: 'red', textAlign: 'center'}}>Not offered this semester</h3>
            </div>
        )
    }
    function prev_off(){
        if(prev.length!==0) return(
            <div>
        <h2 style={{textAlign: 'center'}}>Previous offerings</h2>
            <table style={{borderCollapse: 'collapse', width: '80%', margin: '0 auto'}}>
                <thead>
                    <tr style={{backgroundColor: '#e0c7c8'}}>
                    <th style={{border: '1px solid black', padding: '8px'}}>Year</th>
                    <th style={{border: '1px solid black', padding: '8px'}}>Semester</th>
                    <th style={{border: '1px solid black', padding: '8px'}}>Section Id</th>
                    <th style={{border: '1px solid black', padding: '8px'}}>Instructors</th>
                    <th style={{border: '1px solid black', padding: '8px'}}>Venue</th>
                    <th style={{border: '1px solid black', padding: '8px'}}>Time Slot</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(prev).map((k, i) => {
                        let n = prev[k]
                        return (
                            <tr style={{backgroundColor: '#f2f2f2'}}>
                                <td style={{border: '1px solid black', padding: '8px'}}>{n.year}</td>
                                <td style={{border: '1px solid black', padding: '8px'}}>{n.semester}</td>
                                <td style={{border: '1px solid black', padding: '8px'}}>{n.sec_id}</td>
                                <td style={{border: '1px solid black', padding: '8px'}}>{
                                    Object.keys(n.instrs).map((k, i) => {
                                        let m = n.instrs[k]
                                        let f = '/instr/instructor/'+m.id
                                        return (
                                            <a href={f}>{m.name}</a>
                                        )
                                    }
                                    )
                                }</td>
                                <td style={{border: '1px solid black', padding: '8px'}}>{n.room_number}, {n.building}</td>
                                <td style={{border: '1px solid black', padding: '8px'}}>{n.time_slot_id}</td>
                            </tr>
                        )
                    }
                    )}
                </tbody>
            </table>
        </div>
        )
        else return(
            <div>
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
            <h1>Course Not Found</h1>
        </div>
    )
    else return (
        <div>
            <h1 style={{textAlign: 'center'}}>Course {course_id}</h1>
            <div>
            <table style={{borderCollapse: 'collapse', width: '80%', margin: '0 auto'}}>
                <tbody>
                <tr>
                    <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#e0c7c8'}}>NAME</th>
                    <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2'}}>{course_name}</th>
                </tr>
                <tr>
                    <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#e0c7c8'}}>DEPARTMENT</th>
                    <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2'}}>{dept}</th>
                </tr>
                <tr>
                    <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#e0c7c8'}}>CREDITS</th>
                    <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2'}}>{credits}</th>
                </tr>
                </tbody>
            </table>
        </div>
        {curr_off()}
        {prereq_fun()}
        {prev_off()}
        </div>
    );
}

export default CoursePage;