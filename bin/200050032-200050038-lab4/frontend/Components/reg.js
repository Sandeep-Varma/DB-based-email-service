import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import searchlogo from "../Assets/search.svg";
// import { ReactSearchAutocomplete } from 'react-search-autocomplete'

const Registration=()=>{
    const navigate = useNavigate();
    const [s, setS] = useState("Select");
    const [fetch_status, setFetchStatus] = useState(false);
    const [string, setString] = useState("");  
    // const [alert, setAlert] = useState(false);
    // const [data, setData] = useState([]);
    // const [search, setSearch] = useState([]);
    // const [selected, setSelected] = useState("");
    // const [error, setError] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [done, setDone] = useState(false);
    const [logged_in, setLoggedIn] = useState(false);
    const [reg_over, setRegOver] = useState(false);

    const OnSearch = () => {
        // remove leading and trailing spaces
        string.trim();
        if (string === "") return;
        setDone(false);
        console.log("searching")
        console.log(string)
        fetch('http://localhost:4000/reg_search/'+string, {
            method: 'GET',
            mode: 'cors',
            credentials: 'include'
        })
        .then(response=>response.json())
        .then(
            async (response)=>{
                console.log(response)
                if (response[0].status === "-2") setFetchStatus(false);
                else setFetchStatus(true);
                if (response[0].status === "-1"){
                    setDone(true);
                    setLoggedIn(false);
                    navigate("/login");
                }
                else setLoggedIn(true);
                if (response[0].status === "0"){
                    setLoggedIn(true);
                    setSearchResults(response.splice(1))
                }
                setDone(true);
            }
        )
    }

    useEffect(()=>{
    const f=()=>{
        fetch('http://localhost:4000/check_login', {
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
        })
        .then(response=>response.json())
        .then(
            async (response)=>{
                if (response[0].status === "-1") navigate("/login");
                else if (response[0].role === "i") navigate("/instr_home");
                else setLoggedIn(true);
                setFetchStatus(true);
                fetch('http://localhost:4000/reg_check_date', {
                    method: 'GET',
                    mode: 'cors',
                    credentials: 'include'
                })
                .then(response=>response.json())
                .then(
                    async (response)=>{
                        console.log(response)
                        if (response[0].status) setRegOver(true);
                    }
                )
                setDone(true);
            }
        )
    }
    f()
    }, [navigate]);

    const reg_course = (c_id) => {
        var s_id = s;
        if (s === "Select"){
            alert("Please select a section");
            return;
        }
        setFetchStatus(false);
        setDone(false);
        fetch('http://localhost:4000/reg_course/'+c_id+'/'+s_id, {
            method: 'GET',
            mode: 'cors',
            credentials: 'include'
        })
        .then(response=>response.json())
        .then(
            async (response)=>{
                console.log(response)
                if (response[0].status === "-2") setFetchStatus(false);
                else setFetchStatus(true);
                if (response[0].status === "-1"){
                    setDone(true);
                    setLoggedIn(false);
                    navigate("/login");
                }
                else setLoggedIn(true);
                if (response[0].status === "0"){
                    alert("Course "+c_id+" registered successfully");
                    navigate(0);
                }
                else if (response[0].status === "-3"){
                    alert("Course already registered/taken");
                }
                else if (response[0].status === "-4"){
                    alert("Prerequisites not met");
                }
                else if (response[0].status === "-5"){
                    alert("Time slot clash");
                }
                setDone(true);
            }
        )
    }

    if (!done) return (
        <div><h1>Loading...</h1></div>
    )
    else if (reg_over) return (
        <div>
            <h1>Registration Period is Over</h1>
        </div>
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
            {/* <h1>Course Registration</h1> */}
            <div>
                <form style={{
                    display: "flex",
                    flexDirection: "row",
                    // alignItems: "center",
                    width: "80%",
                    marginTop: "2%",
                    marginLeft: "10%"
                }}>
                <input
                    type="text"
                    value={string}
                    onChange={e => setString(e.target.value)}
                    placeholder="Search with Course Code or Course Name"
                    style={{
                    fontSize: "18px",
                    padding: "10px",
                    //   marginBottom: "20px",
                    borderRadius: "50px",
                    border: "none",
                    boxShadow: "0 0 5px #888888",
                    width: "100%"
                    }}
                />
                <button type="submit" onClick={()=>OnSearch()} style={{
                    fontSize: "18px",
                    // padding: "10px",
                    // marginTop: "20px",
                    width: "5%",
                    backgroundColor: "#2066C5",
                    // color: "#ffffff",
                    borderRadius: "30px",
                    border: "none",
                    // boxShadow: "0 0 5px #888888"
                }}>
                    {/* put search-icon.webp icon in img */}
                    <img src={searchlogo} alt="Search" style={{width: "50%", height: "60%"}}/>
                    </button>
                </form>
                <table style={{borderCollapse: 'collapse', width: '80%', margin: '0 auto', marginTop: '2%'}}>
                <thead>
                    <tr>
                    <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#e0c7c8'}}>Course Code</th>
                    <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#e0c7c8'}}>Course Name</th>
                    <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#e0c7c8'}}>Section</th>
                    <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#e0c7c8'}}>Register</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(searchResults).map((key, index) => {
                        var p;
                        var q = '/course/'+searchResults[key].course_id;
                        return (
                            <tr key={index}>
                                <td style={{border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2'}}><a href = {q}>{searchResults[key].course_id}</a></td>
                                <td style={{border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2'}}>{searchResults[key].title}</td>
                                <td style={{border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2'}}>
                                    <select onChange={(e)=>{setS(e.target.value)}}>
                                        <option value="Select">Select</option>
                                        {Object.keys(searchResults[key].sections).map((section, index) => {
                                            p = searchResults[key].sections[section]
                                            return (
                                                <option key={section} value={p.sec_id}>S{p.sec_id}</option>
                                            )
                                        })}
                                    </select>
                                </td>
                                <td style={{border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2'}}><button style={{float: 'center',backgroundColor: '#4CAF50', color: 'white', padding: '8px', border: 'none', borderRadius: '10px'}} onClick={()=>{if (window.confirm('Are you sure you wish to register to course '+searchResults[key].course_id+'?')) reg_course(searchResults[key].course_id)}}>Register</button></td>
                            </tr>
                        )
                    }
                    )}
                </tbody>
                </table>
            </div>
        </div>
    );
}

export default Registration;
