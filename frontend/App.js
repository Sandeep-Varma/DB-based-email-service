// import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import SignUp from './Components/signup';
import LoginUser from './Components/login';
import MailPage from './Components/mailbox';
// import Registration from './Components/reg';
// import CoursePage from './Components/course';
// import CoursePage2 from './Components/course2';
// import InstrPage from './Components/instr';
// import InstrPage2 from './Components/instr2';
// import AllStudentsPage from './Components/all_students'
// import StudentPage from './Components/studentpage';
// import InstrHomePage from './Components/instr_home';
// import AllCoursePage from './Components/all_courses';
// import AllCoursePage2 from './Components/all_courses2';
// import AllDeptsPage from './Components/all_depts';
// import AllDeptsPage2 from './Components/all_depts2';
// import DeptAllCoursePage from './Components/all_dept_courses';
// import DeptAllCoursePage2 from './Components/all_dept_courses2';
// import RunningCoursePage from './Components/running_courses';
// import RunningCoursePage2 from './Components/running_courses2';
// import DeptCoursePage from './Components/dept_courses';
// import DeptCoursePage2 from './Components/dept_courses2';
import DefaultRedirector from './Components/default';
// import NavBar from './Components/nav';
// import NavBar2 from './Components/nav2';

const App = ()=>{
  return (
    <>
    <Router forceRefresh={true}>
        <Routes>
          <Route exact path="/login" element={<LoginUser/>}/>
          <Route exact path="/signup" element={<SignUp/>}/>
          <Route exact path="/mail/:box" element={<MailPage/>}/>
          {/* <Route exact path="/course/running/" element={<><NavBar/><RunningCoursePage/></>}/> */}
          <Route path ="*" element={<DefaultRedirector/>}/>
        </Routes>
    </Router>
    </>
  );
}

export default App;
