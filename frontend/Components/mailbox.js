import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
// import React, { useEffect, useState } from 'react';
import "./mailbox.css"


const MailPage = () => {
    const navigate = useNavigate();
    const { box } = useParams();
    const [server_error, setServerError] = useState(false);
    const [logged_in, setLoggedIn] = useState(false);
    const [done, setDone] = useState(false);
    const [data, setData] = useState([]);
    const [selectedMail, setSelectedMail] = useState(null);


    const FetchMail = (sender_id, mail_num) => {
        fetch('http://localhost:4000/get_mail/' + box, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                sender_id: sender_id,
                mail_num: mail_num
            })
        })
        .then(response => response.json())
        .then(
            async (response) => {
                console.log(response)
                setSelectedMail(response[1][0]);
                setStarred(response[1][0].starred);
            }
        )
    }

    useEffect(() => {
        const f = async () => {
            fetch('http://localhost:4000/mail/' + box, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
            })
                .then(response => response.json())
                .then(
                    async (response) => {
                        console.log(response)
                        if (response[0][0].status === "not_logged_in") navigate("/login");
                        else setLoggedIn(true);
                        if (response[0][0].status.startsWith("err_")) setServerError(true);
                        else if (response[0][0].status === "invalid_box") navigate("/mail/inbox");
                        else {

                        }
                        setDone(true)
                        setData(response[2]);
                    }
                )
                .catch((error) => { console.log(error); });
        }
        f();
    }, [navigate, box]);

    const modify = (sender_id, mail_num, starred, is_read) => {
        fetch('http://localhost:4000/modify', {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                sender_id: sender_id,
                mail_num: mail_num,
                s: starred,
                r: is_read
            })
        })
        .then(response => response.json())
        .then(
            async (response) => {
                if (response[0][0].status !== "0") setServerError(true);
            }
        )
    }

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
    else return (
        <div>
            <div className="mail-page-container">
                <div className="mail-list-container">
                    {/* Left box for email list */}
                    <div className="mail-list-box">
                        <h3 className="mail-list-header">Mailbox</h3>
                        <ul className="mail-list">
                            {data.map((mail) => (
                                <li key={mail.id} onClick={() => FetchMail(mail.sender_id, mail.mail_num)}>
                                    <div className="mail-item">
                                        <div className="mail-sender">{mail.sender_id}</div>

                                        <div className="mail-subject">{mail.subject}</div>
                                        <div className="mail-date">{mail.time}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="mail-display-container">
                    {/* Right box for displaying selected email */}
                    {selectedMail && (
                        <div className="mail-display">
                            <h2>{selectedMail.subject}</h2>
                            <p>Sent at: {selectedMail.time}</p>
                            <p>Content:{selectedMail.content}</p>
                            <p>{selectedMail.body}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MailPage;