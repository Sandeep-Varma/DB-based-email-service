import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";

const ComposePage = ()=>{
    const navigate = useNavigate();
    const { num } = useParams();
    const [server_error, setServerError] = useState(false);
    const [logged_in, setLoggedIn] = useState(false);
    const [done, setDone] = useState(false);
    
    const send_mail = ()=>{
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
                    console.log(response)
                    if (response[0][0].status == "not_logged_in") navigate("/login");
                    else setLoggedIn(true);
                    if (response[0][0].status.startsWith("err_")) setServerError(true);
                    else {
                        if (response[0][0].status !== "0"){

                        }
                    }
                    setDone(true)
                }
            )
            .catch((error)=>{console.log(error);});
        }
        f();
    },[navigate]);
    
    if (!done) return (
        <div>
            <h1>Loading ...</h1>
        </div>
    )
    else if (!server_error) return (
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
    else return (
        <div>
            <h1>Webpage in development</h1>
        </div>
    )
    // return (
    //     <>
    //     <div style = {{backgroundColor: '#84c3bd'}}>
    //     <div style={{ display: "flex", flexDirection: "column", justifyContent: "center"}}>
    //     <h1 style={{ textAlign: "center" }}>Student Home</h1>
    //     <table style={{borderCollapse: 'collapse', width: '60%', margin: '0 auto'}}>
    //         <tbody>
    //         <tr>
    //         <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#e0c7c8'}}>ID</th>
    //         <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2'}}>{id}</th>
    //         </tr>
    //         <tr>
    //         <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#e0c7c8'}}>NAME</th>
    //         <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2'}}>{name}</th>
    //         </tr>
    //         <tr>
    //         <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#e0c7c8'}}>DEPARTMENT</th>
    //         <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2'}}>{dept}</th>
    //         </tr>
    //         <tr>
    //         <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#e0c7c8'}}>TOTAL CREDITS</th>
    //         <th style={{border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2'}}>{credits}</th>
    //         </tr>
    //         </tbody>
    //     </table>
    //     {running.length>0 && <><div style={{clear: 'both'}}></div>
    //         <h2 style={{textAlign: 'center'}}>Running Semester - {running[0].semester} {running[0].year}</h2>
    //         <table style={{borderCollapse: 'collapse', width: '80%', margin: '0 auto'}}>
    //                     <thead>
    //                         <tr style={{backgroundColor: '#e0c7c8'}}>
    //                         <th style={{border: '1px solid black', padding: '8px'}}>Course ID</th>
    //                         <th style={{border: '1px solid black', padding: '8px'}}>Course Title</th>
    //                         <th style={{border: '1px solid black', padding: '8px'}}>Credits</th>
    //                         <th style={{border: '1px solid black', padding: '8px'}}>Grade</th>
    //                         <th style={{border: '1px solid black', padding: '8px'}}>Drop</th>
    //                         </tr>
    //                     </thead>
    //                     <tbody>
    //                         {
    //                         Object.keys(running).map((h,j) => {
    //                             let p = running[h];
    //                             let n = "/course/" + p.course_id;
    //                             return (
    //                             <tr key={j} style={{border: '1px solid black', backgroundColor: '#f2f2f2'}}>
    //                                 <td style={{border: '1px solid black', padding: '8px'}}><a href={n}>{p.course_id}</a></td>
    //                                 <td style={{border: '1px solid black', padding: '8px'}}>{p.title}</td>
    //                                 <td style={{border: '1px solid black', padding: '8px'}}>{p.credits}</td>
    //                                 <td style={{border: '1px solid black', padding: '8px'}}>{p.grade}</td>
    //                                 <td style={{border: '1px solid black', padding: '8px'}} onClick={() => {if (window.confirm('Are you sure you wish to deregister this course?')) drop_course(p.course_id)}}><button style={{backgroundColor: 'red', color: 'white', padding: '8px', border: 'none', borderRadius: '5px'}}>Drop</button></td>
    //                             </tr>
    //                             )
    //                         })
    //                         }
    //                     </tbody>
    //                 </table>
    // </>}
    // {running.length===0 && <>
    //         <h2 style={{textAlign: 'center', color: 'red'}}>No Courses in Running Semester</h2>
    //     </>
    // }    
    //     {Object.keys(data).map((k, i) => {
    //         let d = data[k]
    //         return (
    //             <div style={{ display: "flex", flexDirection: "column"}}>
    //                 <h2 style={{textAlign: 'center'}}>{d[0].semester} {d[0].year}</h2>
    //                 <table style={{borderCollapse: 'collapse', width: '80%', margin: '0 auto'}}>
    //                     <thead>
    //                         <tr style={{backgroundColor: '#e0c7c8'}}>
    //                         <th style={{border: '1px solid black', padding: '8px'}}>Course ID</th>
    //                         <th style={{border: '1px solid black', padding: '8px'}}>Course Title</th>
    //                         <th style={{border: '1px solid black', padding: '8px'}}>Credits</th>
    //                         <th style={{border: '1px solid black', padding: '8px'}}>Grade</th>
    //                         </tr>
    //                     </thead>
    //                     <tbody>
    //                         {
    //                         Object.keys(d).map((h,j) => {
    //                             let p = d[h];
    //                             let n = "/course/" + p.course_id;
    //                             return (
    //                             <tr key={j} style={{border: '1px solid black', backgroundColor: '#f2f2f2'}}>
    //                                 <td style={{border: '1px solid black', padding: '8px'}}><a href={n}>{p.course_id}</a></td>
    //                                 <td style={{border: '1px solid black', padding: '8px'}}>{p.title}</td>
    //                                 <td style={{border: '1px solid black', padding: '8px'}}>{p.credits}</td>
    //                                 <td style={{border: '1px solid black', padding: '8px'}}>{p.grade}</td>
    //                             </tr>
    //                             )
    //                         })
    //                         }
    //                     </tbody>
    //                 </table>
    //             </div>
    //         )

    //     })}
    //     </div>
    //     </div>
    //     </>
    // )

}


export default ComposePage;