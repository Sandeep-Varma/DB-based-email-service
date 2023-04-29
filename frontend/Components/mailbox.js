import React, { useEffect, useState } from 'react';
import { useNavigate, useParams,Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faEnvelopeOpen } from '@fortawesome/free-solid-svg-icons';
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
  const inbox = box === 'inbox';
  // console.log(inbox)
  const sent = box === 'sent';
  const scheduled = box === 'scheduled';
  const starred = box === 'starred';
  const draft = box === 'drafts';
  const trash = box === 'trash';




  const FetchMail = (sender_id, mail_num) => {
    fetch('http://localhost:4000/get_mail', {
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
          if (response[0][0].status === "not_logged_in") navigate("/login");
          console.log(response)
          setSelectedMail(response[1][0]);
        }
      )
  }

  const FetchParentMail = (sender_id, mail_num) => {
    fetch('http://localhost:4000/get_parent_mail', {
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
          if (response[0][0].status === "not_logged_in") navigate("/login");
          console.log(response)
          // to do

        }
      )
  }

  const Deletmail = (sender_id, mail_num) => {
    console.log("delete called")
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

  const modify = (sender_id, mail_num, modifications) => {
    console.log("modify called, starred: " + modifications)
    fetch('http://localhost:4000/modify', {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        s_id: sender_id,
        mn: mail_num,
        mod: modifications
      })
    })
      .then(response => response.json())
      .then(response => {
        if (response[0][0].status === "not_logged_in") navigate("/login");
        else if (response[0][0].status !== "0") { setServerError(true); console.log(response) }
      })
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
      <nav class="navigation">
        {/* Navigation items */}
        <ul>
          <li className><Link to="/mail/compose/0/0/0">COMPOSE</Link></li>
          <li className={box === 'inbox' ? 'active' : ''}><Link to="/mail/inbox">INBOX</Link></li>
          <li className={box === 'starred' ? 'active' : ''}><Link to="/mail/starred">STARRED</Link></li>
          <li className={box === 'sent' ? 'active' : ''}><Link to="/mail/sent">SENT</Link></li>
          <li className={box === 'drafts' ? 'active' : ''}><Link to="/mail/drafts">DRAFTS</Link></li>
          <li className={box === 'scheduled' ? 'active' : ''}><Link to="/mail/scheduled">SCHEDULED</Link></li>
          <li className={box === 'trash' ? 'active' : ''}><Link to="/mail/trash">TRASH</Link></li>
        </ul>
      </nav>
      <div className="mail-page-container">
        <div className="mail-list-container">
          <div className="mail-list-box">
            <h3>{box}</h3>
            <ul className="mail-list">
              {data.map((mail) => (
                <li key={mail.id}>
                  <div className="mail-item" onClick={() => FetchMail(mail.sender_id, mail.mail_num)}>
                    <div className={`mail-status${mail.read ? '-read' : ''}`}>{mail.sender_id} {mail.subject}</div>
                    <div className={`mail-status${mail.read ? '-read' : ''}`}>{mail.time} {mail.read}</div>

                    {(inbox || starred )&&(<div className="mark-read-unread" onClick={(e) => {
                      e.stopPropagation();
                      modify(mail.sender_id, mail.mail_num, { r: !(mail.read) });
                      mail.read = !(mail.read)
                    }}>
                      {mail.read ? <FontAwesomeIcon icon={faEnvelope} /> : <FontAwesomeIcon icon={faEnvelopeOpen} />}
                      {/* <span>{mail.read ? 'Mark as unread' : 'Mark as read'}</span> */}
                    </div>)}


                    <div className={`mail-star${mail.starred ? '-starred' : ''}`} onClick={(e) => {
                      e.stopPropagation();
                      modify(mail.sender_id, mail.mail_num, { s: !(mail.starred) });
                      mail.starred = !(mail.starred)
                    }}>
                      &#9733;
                    </div>


                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="resize-handle"></div>
        </div>
        <div className="mail-display-container">
          {/* Right box for displaying selected email */}
          {selectedMail && (
            <div className="mail-display">
              {!trash && <div className="move-to-trash-button" onClick={() => { modify(selectedMail.sender_id, selectedMail.mail_num, { t: true }); navigate('/mail/' + box) }}>
                Move to trash
              </div>}
              {inbox && (<div className="reply-button" onClick={() => navigate("/mail/compose/" + selectedMail.sender_id + "/" + selectedMail.mail_num + "/0")}>
                Reply
              </div>)}

              {
                scheduled && (<div className="move-to-drafts" onClick={() => navigate("/mail/compose/" + selectedMail.mail_num + "/0/0")}>
                  Move to drafts
                </div>
                )}

              {
                draft && (<div className="edit-draft" onClick={() => navigate("/mail/compose/"  + selectedMail.mail_num + "/0/0")}>
                  SEND OR EDIT DRAFT
                </div>)
              }

              <div>
                <h2>{selectedMail.subject}</h2>
                <p>Sent at: {selectedMail.time}</p>
                <p>sender_id: {selectedMail.sender_id}</p>
                <p>mail_num: {selectedMail.mail_num}</p>
                <p>Subject: {selectedMail.subject}</p>
                <p>Content:{selectedMail.content}</p>
                <p>{selectedMail.body}</p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>

  )
}

export default MailPage;