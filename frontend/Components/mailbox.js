import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from "react-router-dom";
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
  const [selectedMailThread, setSelectedMailThread] = useState([]);
  const inbox = box === 'inbox';
  const sent = box === 'sent';
  const scheduled = box === 'scheduled';
  const starred = box === 'starred';
  const draft = box === 'drafts';
  const trash = box === 'trash';
  const [tl, setTl] = useState(0);

  const renderMailContent = (mail, index) => {
    const indentation = "       ".repeat(index);
    const indentedContent = indentation + mail.sender_id;
    const indentedContent1 = indentation + mail.subject;
    const indentedContent2 = indentation + mail.content;

   return(
    <div>
      <pre>{indentedContent}</pre>
      <pre>{indentedContent1}</pre>
      <pre>{indentedContent2}</pre>
      <div style={{ marginBottom: "70px" }}></div>
    </div>
   )

  };

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
          setSelectedMailThread([response[1][0]]);
        }
      )
  }

  useEffect(() => {
    console.log("selectedMailthread", selectedMailThread)
    console.log("tl", tl)
    if (tl != selectedMailThread.length) {
      setTl(selectedMailThread.length);
    }
  }, [selectedMailThread])

  useEffect(() => {

    if (tl > 0) {
      console.log(selectedMailThread[0])
      fetch('http://localhost:4000/get_parent_mail', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sender_id: selectedMailThread[selectedMailThread.length - 1].sender_id,
          mail_num: selectedMailThread[selectedMailThread.length - 1].mail_num
        })
      })
        .then(response => response.json())
        .then(
          async (response) => {
            if (response[0][0].status === "not_logged_in") navigate("/login");
            console.log(response)
            if (response[1].length != 0) {
              setSelectedMailThread(selectedMailThread.concat([response[1][0]]))
              console.log(selectedMailThread)
              // return true;
            }


          }
        )
    }
  }, [tl])


  // const FetchParentMail = () => {
  //   // if(false)
  //   if(false){
  //   fetch('http://localhost:4000/get_parent_mail', {
  //     method: 'POST',
  //     mode: 'cors',
  //     credentials: 'include',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Accept': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       sender_id: selectedMailThread[selectedMailThread.length - 1].sender_id,
  //       mail_num: selectedMailThread[selectedMailThread.length - 1].mail_num
  //     })
  //   })
  //     .then(response => response.json())
  //     .then(
  //       async (response) => {
  //         if (response[0][0].status === "not_logged_in") navigate("/login");
  //         console.log(response)
  //         // to do
  //         //push to selectedParentMail
  //         if (response[1][0] != 0) {
  //           setSelectedMailThread(selectedMailThread.concat([response[1][0]]))
  //           console.log(selectedMailThread)
  //           // return true;
  //         }


  //       }
  //     )
  //   }
  // }

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
                  <div className="mail-item" onClick={() => {
                    // setSelectedParentMail([]);
                    FetchMail(mail.sender_id, mail.mail_num);
                    // FetchParentMail(mail.sender_id, mail.mail_num);
                  }
                  }>
                    <div className={`mail-status${mail.read ? '-read' : ''}`}>{mail.sender_id} {mail.subject}</div>
                    <div className={`mail-status${mail.read ? '-read' : ''}`}>{mail.time} {mail.read}</div>

                    {(inbox || starred) && (<div className="mark-read-unread" onClick={(e) => {
                      e.stopPropagation();
                      modify(mail.sender_id, mail.mail_num, { r: !(mail.read) });
                      mail.read = !(mail.read)
                    }}>
                      {mail.read ? <FontAwesomeIcon icon={faEnvelopeOpen} /> : <FontAwesomeIcon icon={faEnvelope} />}
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
          {selectedMailThread[0] && (
            <div className="mail-display">
              {!trash && <div className="move-to-trash-button" onClick={() => { modify(selectedMailThread[0].sender_id, selectedMailThread[0].mail_num, { t: true }); navigate('/mail/' + box) }}>
                Move to trash
              </div>}
              {(inbox || starred) && (<div className="reply-button" onClick={() => navigate("/mail/compose/0/" + selectedMailThread[0].sender_id + "/" + selectedMailThread[0].mail_num)}>
                Reply
              </div>)}

              {
                scheduled && (<div className="move-to-drafts" onClick={() => {
                  modify(selectedMailThread[0].sender_id, selectedMailThread[0].mail_num, { dr: "true" });
                  navigate('/mail/inbox')
                }

                }>
                  Move to drafts
                </div>
                )}

              {
                draft && (<div className="edit-draft" onClick={() => navigate("/mail/compose/" + selectedMailThread[0].mail_num + "/0/0")}>
                  SEND OR EDIT DRAFT
                </div>)
              }

              <div>
                {/* NEEd to write the code here */}
                {selectedMailThread.map((mail, index) => (
                  <div key={mail.id}>
                    {renderMailContent(mail, index)}
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>

  )
}

export default MailPage;