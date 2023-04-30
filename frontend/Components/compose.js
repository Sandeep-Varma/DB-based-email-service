import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

import './compose.css'

const ComposePage = () => {
    const navigate = useNavigate();
    const { num, p_id, p_mn } = useParams();
    const [server_error, setServerError] = useState(false);
    const [draft_not_found, setDraftNotFound] = useState(false);
    const [parent_not_found, setParentNotFound] = useState(false);
    const [logged_in, setLoggedIn] = useState(false);
    const [done, setDone] = useState(false);

    const [to_string, setToString] = useState("");
    const [cc_string, setCcString] = useState("");
    const [rec_empty, setRecEmpty] = useState(false);
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [scheduled, setIsScheduled] = useState(false);
    const [pid, setPid] = useState(p_id);
    const [pmn, setPmn] = useState(p_mn);
    const [dt_filled, setDtFilled] = useState(true);
    const [not_found_ID, setNotFoundID] = useState("0");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedFileNames, setSelectedFileNames] = useState([]);
    const [selectedFilesData, setSelectedFilesData] = useState([]);



    const handleFileChange = (event) => {
        const files = event.target.files;
        const fileArray = Array.from(files).map((file) => ({
            file: file,
            name: file.name
        }));
        setSelectedFiles((prevFiles) => [...prevFiles, ...fileArray]);

        const reader = new FileReader();
        reader.onload = (e) => {
            const fileContent = e.target.result;
            const base64Data = btoa(fileContent);
            setSelectedFilesData((prevData) => [...prevData, base64Data]);
        };

        Array.from(files).forEach((file) => {
            reader.readAsBinaryString(file);
        });

        const fileNames = Array.from(files).map((file) => file.name);
        setSelectedFileNames((prevNames) => [...prevNames, ...fileNames]);
    };


    useEffect(() => {
        // console.log(selectedFiles);
        // const names = selectedFiles.map((file) => file.name);

        console.log("files", selectedFiles);
        // setAttachmentNames(names);
    }, [selectedFiles]);

    useEffect(() => {
        console.log("data:", selectedFilesData);

    }, [selectedFilesData]);

    useEffect(() => {
        console.log("names:", selectedFileNames);

    }, [selectedFileNames]);


    const check_ids = async (ids) => {
        try {
            let response = await fetch('http://localhost:4000/check_ids', {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    ids_list: ids
                })
            })
            response = await response.json()
            return response[0][0].status;
        }
        catch (err) {
            return "err_checking_valid_ids";
        }
    }

    const send_mail = (draft) => {
        setDtFilled(true);
        setRecEmpty(false);
        setNotFoundID("0");
        let to = to_string.replace(/[\s\n]/g, ',').split(',').filter(s => s)
        let cc = cc_string.replace(/[\s\n]/g, ',').split(',').filter(s => s)
        cc = cc.filter(x => !(to.includes(x)))
        to = Array.from(new Set(to))
        cc = Array.from(new Set(cc))
        if (scheduled && (date === "" || time === "")) setDtFilled(false);
        else if (to.length === 0 && cc.length === 0) setRecEmpty(true);
        else {
            let recipients_list = to.concat(cc)
            check_ids(recipients_list)
                .then(output => {
                    if (output.startsWith("err_")) setServerError(true);
                    else if (output !== "0") setNotFoundID(output);
                    else {
                        fetch('http://localhost:4000/send_mail/' + num, {
                            method: 'POST',
                            mode: 'cors',
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({
                                to_recipients: to,
                                cc_recipients: cc,
                                subject: subject,
                                content: content,
                                is_draft: draft,
                                is_scheduled: scheduled,
                                send_time: date + " " + time,
                                p_id: pid,
                                p_mn: pmn,
                                att: {
                                    names: selectedFileNames, // Pass the attachment names
                                    data: selectedFilesData // Pass the attachment data
                                }
                            })
                        })
                            .then(response => response.json())
                            .then(
                                async (response) => {
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


    useEffect(() => {
        const f = async () => {
            fetch('http://localhost:4000/compose/' + num + '/' + pid + '/' + pmn, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
            })
                .then(response => response.json())
                .then(
                    async (response) => {
                        if (response[0][0].status === "not_logged_in") navigate("/login")
                        else setLoggedIn(true)
                        if (response[0][0].status.startsWith("err_")) setServerError(true)
                        else {
                            if (num !== "0") {
                                if (response[1].length === 0) setDraftNotFound(true)
                                else {
                                    console.log(response)
                                    setSubject(response[1][0].subject)
                                    setContent(response[1][0].content)
                                    let temp = ""
                                    for (let i = 0; i < response[2].length - 1; i++) temp = temp.concat(response[2][i].id, ", ")
                                    if (response[2].length > 0) temp = temp.concat(response[2][response[2].length - 1].id)
                                    setToString(temp)
                                    temp = ""
                                    for (let i = 0; i < response[3].length - 1; i++) temp = temp.concat(response[3][i].id, ", ")
                                    if (response[3].length > 0) temp = temp.concat(response[3][response[3].length - 1].id)
                                    setCcString(temp)
                                    if (response[4].length === 0) {
                                        setPid(0);
                                        setPmn(0);
                                    }
                                    else {
                                        setPid(response[4][0].p_id)
                                        setPmn(response[4][0].p_mail_num)
                                    }
                                }
                            }
                            else if (pmn !== "0") {
                                if (response[1].length === 0) setParentNotFound(true)
                                else {
                                    console.log(response)
                                    setSubject("Re: " + response[1][0].subject)
                                    setToString(response[1][0].sender_id)
                                    let temp = ""
                                    for (let i = 0; i < response[2].length - 1; i++) temp = temp.concat(response[2][i].id, ", ")
                                    if (response[2].length > 0) temp = temp.concat(response[2][response[2].length - 1].id)
                                    setCcString(temp)
                                }
                            }
                        }
                        setDone(true)
                    }
                )
                .catch((error) => { console.log(error); });
        }
        f();
    }, [navigate, num]);

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
    else if (!logged_in) {
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
    else if (parent_not_found) return (
        <div>
            <h1>Parent mail not found</h1>
        </div>
    )
    else return (
        <div className='compose'>
            <h1 >Compose</h1>
            <form >
                <label >To</label>
                <input
                    type="text"
                    value={to_string}
                    onChange={e => setToString(e.target.value)}
                />
                <label >Cc</label>
                <input
                    type="text"
                    value={cc_string}
                    onChange={e => setCcString(e.target.value)} />
                <label >Subject</label>
                <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)} />
                <label >Content</label>
                <textarea rows="10" value={content}
                    onChange={e => setContent(e.target.value)}>
                </textarea>
                {/* add a button "schedule mail" which shows time and date picker */}
                <label ></label>

                {/* add a time and date picker that is shown only on clicking a button*/}
                {scheduled &&
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "left", justifyContent: "space-between", width: "25%" }}>
                        <label ></label>
                        <input
                            type="time"
                            value={time}
                            onChange={e => setTime(e.target.value)} />
                        <label></label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)} />
                    </div>
                }
                {!dt_filled && <p style={{ color: "red" }}>Please select a date and time</p>}
                {not_found_ID !== "0" && <p style={{ color: "red" }}>"{not_found_ID}" is not a user</p>}
                {rec_empty && <p style={{ color: "red" }}>Atleast 1 recipient must be there</p>}
                {/* Put two buttons side by side */}
                <div className='container'>
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "25%"
                    }}>
                        <button className='send-btn' type="button" onClick={() => send_mail(false)}><FontAwesomeIcon icon={faPaperPlane} size='2x' /></button>
                        <button className='save-btn' type="button" onClick={() => send_mail(true)}><FontAwesomeIcon icon={faSave} size='2x' /></button>
                        <button className='schedule-btn'
                            type="button"
                            onClick={e => {
                                if (scheduled) {
                                    setIsScheduled(false);
                                }
                                else {
                                    setIsScheduled(true);
                                }
                            }}>
                            <FontAwesomeIcon icon={faCalendarAlt} size='2x' />
                        </button>

                    </div>
                    <div className='attachments-div'>
                        {selectedFiles.length > 0 && (
                            <div>
                                <div>Selected Files:</div>
                                <ul>
                                    {selectedFiles.map((file, index) => (
                                        <li key={index}>{file.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* File input field */}
                        {/* <label>Attachments</label> */}
                        <input type="file" multiple onChange={handleFileChange} />
                    </div>
                </div>
            </form>
            {/* Display selected file names */}


        </div>
    )
}

export default ComposePage;