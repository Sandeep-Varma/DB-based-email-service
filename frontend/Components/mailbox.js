import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faEnvelopeOpen } from '@fortawesome/free-solid-svg-icons';
import { faReply, faTrash, faUndo, faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons';
// import React, { useEffect, useState } from 'react';
import "./mailbox.css"
import "./mailbox2.css"


const MailPage = () => {
  const navigate = useNavigate();
  const { box } = useParams();
  const [server_error, setServerError] = useState(false);
  const [logged_in, setLoggedIn] = useState(false);
  const [done, setDone] = useState(false);
  const [sData, setSData] = useState([]);
  const [data, setData] = useState([]);
  const [selectedMailThread, setSelectedMailThread] = useState([]);
  const [c, setC] = useState(false)
  // const [sc,setSc] = useState(true)
  const [tl, setTl] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [attachments, setAttachments] = useState([]);

  const renderMailContent = (mail, index) => {
    const indentation = "       ".repeat(index);
    const indentedContent = indentation + "sender:" + mail.sender_id;
    const indentedContent1 = indentation + "subject:" + mail.subject;
    const indentedContent2 = indentation + mail.content;

    return (
      <div className='contentabove0'>
        <pre className='sender-id'>{indentedContent}</pre>
        <pre className='subject'>{indentedContent1}</pre>
        {/* <pre className='sender-text'>{indentedContent2}</pre> */}
        <div class="request-top" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
          <p className='matter'>{indentedContent2}</p>
        </div>
        {/* <div style={{ marginBottom: "70px" }}></div> */}
      </div>
    )
  };

  const view_dt = (time) => {
    let now = new Date();
    let today = new Date(now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate());
    let date = new Date(time.substr(0, 10));
    let diff = (today - date) / (1000 * 60 * 60 * 24);
    if (diff === 0) return "Today " + time.substr(11, 5);
    else if (diff <= 6) return time.substr(17, 3) + " " + time.substr(11, 5);
    else return time.substr(0, 16)
  }

  const handleLogout = () => {
    fetch('http://localhost:4000/logout', {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
    })
      .then(navigate('/login'))
  }

  const change_star = (index) => {
    console.log("changing star")
    let temp = data;
    // if (temp[0].hasOwnProperty('x')) for (let i = 0; i < temp.length; i++) delete temp[i].x;
    // else for (let i = 0; i < temp.length; i++) temp[i].x = 'x';
    // console.log(temp[index].starred)
    temp[index].starred = !(temp[index].starred);
    // console.log(temp[index].starred)
    setData(temp);
    setC(!c)
  }

  const Download_attach = (fileName, fileData) => {
    console.log(fileName, fileData)
    console.log("download called")
    const decodedData = atob(fileData);

    // Convert the decoded data to Uint8Array
    const arrayBuffer = new ArrayBuffer(decodedData.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < decodedData.length; i++) {
      uint8Array[i] = decodedData.charCodeAt(i);
    }

    // Create a Blob object from the Uint8Array data
    const blob = new Blob([uint8Array], { type: 'application/octet-stream' });

    // Create a temporary URL for the Blob object
    const url = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    // Programmatically click the link to trigger the download
    link.click();
  }

  const change_read = (index) => {
    console.log("changing read")
    let temp = data;
    // if (temp[0].hasOwnProperty('x')) for (let i = 0; i < temp.length; i++) delete temp[i].x;
    // else for (let i = 0; i < temp.length; i++) temp[i].x = 'x';
    // console.log(temp[index].read)
    temp[index].read = !(temp[index].read);
    // console.log(temp[index].read)
    setData(temp);
    setC(!c)
    // setSc(!sc)
    // console.log("hi")
  }
  const mark_read = (index) => {
    console.log("changing read")
    let temp = data;
    temp[index].read = true;
    // console.log(temp[index].read)
    setData(temp);
    setC(!c)
    // setSc(!sc)
    // console.log("hi")
  }

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
          console.log("response", response)
          if (response[0][0].status === "not_logged_in") navigate("/login");
          else {
            setSelectedMailThread([response[1][0]]);
            setAttachments(response[2])
          }
        }
      )
  }

  useEffect(() => {
    if (tl !== selectedMailThread.length && selectedMailThread[selectedMailThread.length - 1]) {
      setTl(selectedMailThread.length);
    }
  }, [selectedMailThread])

  useEffect(() => {
    if (tl > 0 && tl === selectedMailThread.length) {
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
            if (response[1].length !== 0) {
              setSelectedMailThread(selectedMailThread.concat([response[1][0]]))
              console.log(selectedMailThread)
              // return true;
            }
          }
        )
    }
  }, [tl])


  useEffect(() => {
    console.log("Changing sData")
    if (searchQuery !== '') {
      setSData(data.filter((mail) => {
        return mail.sender_id.toLowerCase().includes(searchQuery.toLowerCase()) || mail.subject.toLowerCase().includes(searchQuery.toLowerCase())
      }))
    }
    else {
      console.log("No search string")
      setSData(data)
    }
  }, [searchQuery, data, c])

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
            if (response[0][0].status === "not_logged_in") navigate("/login");
            else setLoggedIn(true);
            if (response[0][0].status.startsWith("err_")) setServerError(true);
            else if (response[0][0].status === "invalid_box") navigate("/mail/inbox");
            else {
              let temp = response[2];
              for (let i = 0; i < temp.length; i++) {
                temp[i].index = i;
              }
              setData(temp);
              setSData(temp);
              setSearchQuery('');
              setSelectedMailThread([]);
            }
            setDone(true)
          }
        )
        .catch((error) => { console.log(error); });
    }
    f();
  }, [navigate, box]);

  const modify = (sender_id, mail_num, modifications) => {
    console.log("modify called:", modifications)
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
    <div className='outer'>
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
          <button onClick={handleLogout}>Logout</button>
        </ul>
      </nav>
      <div className="mail-page-container">
        <div className="mail-list-container">
          <div className="mail-list-box">
            <h1>{box}</h1>
            <ul className="mail-list">
              <input className='input-box' type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by subject or sender ID" />

              {sData.map((mail) => (
                <li key={mail.id}>
                  <div className="mail-item" onClick={() => {
                    {
                      FetchMail(mail.sender_id, mail.mail_num);
                      modify(mail.sender_id, mail.mail_num, { r: true });
                      mark_read(mail.index)
                    }
                  }
                  }>
                    <div className="left-box">
                      <div className='left-upper-box'>
                        <p className={`mail-status${mail.read === false ? '' : '-read'}`}>{mail.sender_id} </p>
                        <p className={`mail-status${mail.read === false ? '' : '-read'}`}>{view_dt(mail.time)}</p>
                      </div>
                      <div className='left-lower-box'>
                        <div className={`mail-status-subj${mail.read === false ? '' : '-read'}`}>  {mail.subject === '' ? '(no subject)' : ((mail.subject.length > 25) ? mail.subject.substr(0, 22) + "..." : mail.subject)} </div>
                      </div>
                    </div>
                    <div className="right-box">
                      {(box === 'inbox' || box === 'starred' || box === 'trashed') && (<div className="mark-read-unread" onClick={(e) => {
                        e.stopPropagation();
                        modify(mail.sender_id, mail.mail_num, { r: !(mail.read) });
                        change_read(mail.index)
                        // mail.read = !(mail.read)
                      }}>
                        {mail.read ? <FontAwesomeIcon className='icon' icon={faEnvelopeOpen} /> : <FontAwesomeIcon className='icon' icon={faEnvelope} />}
                        {/* <span>{mail.read ? 'Mark as unread' : 'Mark as read'}</span> */}
                      </div>)}


                      <div className={`mail-star${mail.starred ? '-starred' : ''}`} onClick={(e) => {
                        e.stopPropagation();
                        modify(mail.sender_id, mail.mail_num, (box === 'inbox' || box === 'starred' || box === 'trashed') ? { s: !(mail.starred) } : { ss: !(mail.starred) });
                        change_star(mail.index)
                      }}>
                        &#9733;
                      </div>
                    </div>

                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {selectedMailThread[0] && (

          <div className="mail-display">
            <nav className='secondary-navigation'>
              {!(box === 'trash') && <div className="move-to-trash-button" onClick={() => { modify(selectedMailThread[0].sender_id, selectedMailThread[0].mail_num, (box === 'inbox' || box === 'starred') ? { t: true } : { st: true }); navigate(0); console.log("hi") }}>
                <FontAwesomeIcon icon={faTrash} size='xl' />
              </div>}

              {box === 'trash' && <div className="restore-btn" onClick={() => { modify(selectedMailThread[0].sender_id, selectedMailThread[0].mail_num, { t: false }); navigate(0) }}>
                <FontAwesomeIcon icon={faUndo} size='xl' />
              </div>}

              {box === 'trash' && <div className="move-to-trash-button" onClick={() => { modify(selectedMailThread[0].sender_id, selectedMailThread[0].mail_num, { d: true }); navigate(0) }}>
                <FontAwesomeIcon icon={faTrashAlt} size='xl' />
              </div>}
              {(box === 'inbox' || box === 'starred') && (<div className="reply-button" onClick={() => navigate("/mail/compose/0/" + selectedMailThread[0].sender_id + "/" + selectedMailThread[0].mail_num)}>
                <FontAwesomeIcon icon={faReply} size='xl' />
              </div>)}



              {
                box === 'scheduled' && (<div className="move-to-drafts" onClick={() => {
                  modify(selectedMailThread[0].sender_id, selectedMailThread[0].mail_num, { dr: "true" });
                  navigate('/mail/inbox')
                }

                }>
                  Move to drafts
                </div>
                )}

              {
                box === 'drafts' && (<div className="edit-draft" onClick={() => navigate("/mail/compose/" + selectedMailThread[0].mail_num + "/0/0")}>
                  <FontAwesomeIcon icon={faEdit} size='xl' />
                </div>)
              }
            </nav>
            <div className='content-above2'>
              {/* NEEd to write the code here */}
              {/* show all the attachments and a download button */}


              {selectedMailThread.map((mail, index) => (
                <div className='content-above1' key={mail.id}>
                  {renderMailContent(mail, index)}
                </div>
              ))}
            </div>
            <div >
              <div className='att-div'>
                {attachments.map((attach) => (
                  <div className='attachments' key={attach.att_id}>
                    <p>{attach.file_name.substr(0, 15)}</p> <div className='down-btn' onClick={() => Download_attach(attach.file_name, attach.file_data)}>Download</div>
                  </div>
                )
                )
                }
              </div>

            </div>

          </div>

        )}
        {/* </div> */}
      </div>
    </div>

  )
}

export default MailPage;