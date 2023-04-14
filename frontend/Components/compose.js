import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";

const ComposePage = ()=>{
    const navigate = useNavigate();
    const { num } = useParams();
    const [server_error, setServerError] = useState(false);
    const [draft_not_found, setDraftNotFound] = useState(false);
    const [logged_in, setLoggedIn] = useState(false);
    const [done, setDone] = useState(false);
    
    const [to_string, setToString] = useState("");
    const [cc_string , setCcString] = useState("");
    const [rec_empty, setRecEmpty] = useState(false);
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [scheduled, setIsScheduled] = useState(false);
    const [dt_filled, setDtFilled] = useState(true);
    const [not_found_ID, setNotFoundID] = useState("0");

    const check_ids = async (ids)=>{
        try {
            let response = await fetch('http://localhost:4000/check_ids', {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept':'application/json'
                },
                body: JSON.stringify({
                    ids_list: ids
                })
            })
            response = await response.json()
            return response[0][0].status;
        }
        catch (err){
            return "err_checking_valid_ids";
        }
    }
    
    const send_mail = (draft)=>{
        setDtFilled(true);
        setRecEmpty(false);
        setNotFoundID("0");
        let to = to_string.replace(/[\s\n]/g,',').split(',').filter(s => s)
        let cc = cc_string.replace(/[\s\n]/g,',').split(',').filter(s => s)
        cc = cc.filter(x => !(to.includes(x)))
        to = Array.from(new Set(to))
        cc = Array.from(new Set(cc))
        if(scheduled && (date === "" || time === "")) setDtFilled(false);
        else if (to.length === 0 && cc.length === 0) setRecEmpty(true);
        else{
            let recipients_list = to.concat(cc)
            check_ids(recipients_list)
            .then(output => {
                if (output.startsWith("err_")) setServerError(true);
                else if (output !== "0") setNotFoundID(output);
                else{
                    fetch('http://localhost:4000/send_mail/'+num, {
                        method: 'POST',
                        mode: 'cors',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept':'application/json'
                        },
                        body: JSON.stringify({
                            to_recipients: to,
                            cc_recipients: cc,
                            subject: subject,
                            content: content,
                            is_draft: draft,
                            is_scheduled: scheduled,
                            send_time: date+" "+time
                        })
                    })
                    .then(response=>response.json())
                    .then(
                        async (response)=>{
                            if (response[0][0].status === "not_logged_in") navigate("/login");
                            else setLoggedIn(true);
                            if (response[0][0].status.startsWith("err_")) setServerError(true);
                            else {
                                // if (is_draft) navigate("/mail/drafts");
                                // else navigate("/mail/sent");
                                navigate("/mail/inbox");
                            }
                        }
                    )
                }
            })
        }
    }

    
    useEffect(()=>{
        const f=async()=>{
            fetch('http://localhost:4000/compose/'+num, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
            })
            .then(response=>response.json())
            .then(
                async (response)=>{
                    if (response[0][0].status === "not_logged_in") navigate("/login")
                    else setLoggedIn(true)
                    if (response[0][0].status.startsWith("err_")) setServerError(true)
                    else {
                        if (num !== "0"){
                            if (response[1].length === 0) setDraftNotFound(true)
                            else {
                                console.log(response)
                                setSubject(response[1][0].subject)
                                setContent(response[1][0].content)
                                let temp = ""
                                for (let i=0; i<response[2].length-1; i++) temp = temp.concat(response[2][i].id,", ")
                                temp = temp.concat(response[2][response[2].length-1].id)
                                setToString(temp)
                                temp = ""
                                for (let i=0; i<response[3].length-1; i++) temp = temp.concat(response[3][i].id,", ")
                                temp = temp.concat(response[3][response[3].length-1].id)
                                setCcString(temp)
                            }
                        }
                    }
                    setDone(true)
                }
            )
            .catch((error)=>{console.log(error);});
        }
        f();
    },[navigate, num]);
    
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
    else if (draft_not_found) return (
        <div>
            <h1>Draft not found</h1>
        </div>
    )
    else return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "50px",
            // backgroundColor: '#530E2D'
        }}>
            <h1 style={{fontSize: "36px", marginBottom: "30px", color: "#333"}}>Compose</h1>
            <form style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "80%",
              backgroundColor: "#84c3bd",
              borderRadius: "10px",
              padding: "50px",
              boxShadow: "0 0 10px #888888"
            }}>
                <label style={{fontSize: "18px", marginBottom: "10px", color: "#333"}}>To</label>
                <input
                    type="text"
                    value={to_string}
                    onChange={e => setToString(e.target.value)}
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
                <label style={{fontSize: "18px", marginBottom: "10px", color: "#333"}}>Cc</label>
                <input
                    type="text"
                    value={cc_string}
                    onChange={e => setCcString(e.target.value)}
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
                <label style={{fontSize: "18px", marginBottom: "10px", color: "#333"}}>Subject</label>
                <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
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
                <label style={{fontSize: "18px", marginBottom: "10px", color: "#333"}}>Content</label>
                <textarea rows = "10" value={content}
                    onChange={e => setContent(e.target.value)}
                    style={{
                    fontSize: "18px",
                    padding: "10px",
                    marginBottom: "20px",
                    borderRadius: "5px",
                    border: "none",
                    boxShadow: "0 0 5px #888888",
                    width: "100%"
                    }}>
                </textarea>
                {/* add a button "schedule mail" which shows time and date picker */}
                    <label style={{fontSize: "18px", marginBottom: "10px", color: "#333"}}></label>
                    <button
                        type="button"
                        onClick={e => {
                            if (scheduled){
                                setIsScheduled(false);
                            }
                            else{
                                setIsScheduled(true);
                            }
                        }}
                        style={{
                        fontSize: "18px",
                        padding: "10px",
                        marginBottom: "20px",
                        borderRadius: "5px",
                        border: "none",
                        boxShadow: "0 0 5px #888888",
                        width: "30%"
                        }}
                    >
                        Schedule Mail
                    </button>
                {/* add a time and date picker that is shown only on clicking a button*/}
                {scheduled &&
                <div style={{display: "flex", flexDirection: "row", alignItems: "left", justifyContent: "space-between", width: "25%"}}>
                <label style={{fontSize: "18px", marginBottom: "10px", color: "#333"}}></label>
                <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    style={{
                    fontSize: "18px",
                    padding: "10px",
                    marginBottom: "20px",
                    borderRadius: "5px",
                    border: "none",
                    boxShadow: "0 0 5px #888888",
                    width: "30%"
                    }}
                />
                <label style={{fontSize: "18px", marginBottom: "10px", color: "#333"}}></label>
                <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    style={{
                    fontSize: "18px",
                    padding: "10px",
                    marginBottom: "20px",
                    borderRadius: "5px",
                    border: "none",
                    boxShadow: "0 0 5px #888888",
                    width: "50%"
                    }}
                />
                </div>
                }
                {!dt_filled && <p style={{color: "red"}}>Please select a date and time</p>}
                {not_found_ID !== "0" && <p style={{color: "red"}}>"{not_found_ID}" is not a user</p>}
                {rec_empty && <p style={{color: "red"}}>Atleast 1 recipient must be there</p>}
                {/* Put two buttons side by side */}
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "25%"
                    }}>
                <button type="button" onClick={()=>send_mail(false)} style={{
                    fontSize: "18px",
                    padding: "10px",
                    marginTop: "20px",
                    // width: "100px",
                    backgroundColor: "#333",
                    color: "#ffffff",
                    borderRadius: "5px",
                    border: "none",
                    boxShadow: "0 0 5px #888888"
                }}>Send</button>
                <button type="button" onClick={()=>send_mail(true)} style={{
                    fontSize: "18px",
                    padding: "10px",
                    marginTop: "20px",
                    // width: "100px",
                    backgroundColor: "#333",
                    color: "#ffffff",
                    borderRadius: "5px",
                    border: "none",
                    boxShadow: "0 0 5px #888888"
                }}>Save as Draft</button></div>
            </form>
        </div>
    )
}

export default ComposePage;