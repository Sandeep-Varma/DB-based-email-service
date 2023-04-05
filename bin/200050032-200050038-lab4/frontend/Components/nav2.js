import React from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import "./NavBar.css";
import iitblogo from "../Assets/iitblogo.png";

function NavBar2() {

  const handleClick = () => {
    window.location.href = "/login";
  };
  const navigate = useNavigate();
  const logout=()=>{
    fetch('http://localhost:4000/logout', {
        method: 'GET', 
        mode: 'cors',
        credentials: 'include'
    })
    navigate("/login")
}
    const running = () => {
        navigate("/instr/course/running");
    };

    const all_courses = () => {
        navigate("/instr/all_courses");
    }

    const all_depts = () => {
        navigate("/instr/all_depts");
    }

    const all_students = () => {
        navigate("/all_students");
    }

    const home = () => {
        navigate("/instr/home");
    };

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          
            <img src={iitblogo} alt="" style={{width: '7%', height: '90%'}}/>
          
          <NavLink exact to="/home" className="nav-logo">
            <p>IITB ASC</p>
          </NavLink>

          <ul className={"nav-menu"}>
            <li className="nav-item">
              <NavLink
                exact
                to="/"
                activeClassName="active"
                className="nav-links"
                onClick={home}
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                exact
                to="/instr/course/running"
                activeClassName="active"
                className="nav-links"
                onClick={running}
              >
                Running Courses
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                exact
                to="/instr/all_courses"
                activeClassName="active"
                className="nav-links"
                onClick={all_courses}
              >
                All Courses
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                exact
                to="/instr/all_depts"
                activeClassName="active"
                className="nav-links"
                onClick={all_depts}
              >
                All Departments
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                exact
                to="/all_students"
                activeClassName="active"
                className="nav-links"
                onClick={all_students}
              >
                All Students
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                exact
                to="/login"
                activeClassName="active"
                className="nav-links"
                onClick={logout}
              >
                Logout
              </NavLink>
            </li>
          </ul>
          <div className="nav-icon" onClick={handleClick}>
            <i className={"fas fa-bars"}></i>
          </div>
        </div>
      </nav>
    </>
  );
}

export default NavBar2;