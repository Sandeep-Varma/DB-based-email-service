// import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import SignUp from './Components/signup';
import LoginUser from './Components/login';
import HomePage from './Components/home';
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
          <Route exact path="/home" element={<HomePage/>}/>
          {/* <Route exact path="/instr/home" element={<><NavBar2/><InstrHomePage/></>}/>
          <Route exact path="/all_students" element={<><NavBar2/><AllStudentsPage/></>}/>
          <Route exact path="/student/:s_id" element={<><NavBar2/><StudentPage/></>}/>
          <Route exact path="/all_courses" element={<><NavBar/><AllCoursePage/></>}/>
          <Route exact path="/instr/all_courses" element={<><NavBar2/><AllCoursePage2/></>}/>
          <Route exact path="/all_depts" element={<><NavBar/><AllDeptsPage/></>}/>
          <Route exact path="/instr/all_depts" element={<><NavBar2/><AllDeptsPage2/></>}/>
          <Route exact path="/all_dept_courses/:dept_name" element={<><NavBar/><DeptAllCoursePage/></>}/>
          <Route exact path="/instr/all_dept_courses/:dept_name" element={<><NavBar2/><DeptAllCoursePage2/></>}/>
          <Route exact path="/home/registration" element={<><NavBar/><Registration/></>}/>
          <Route exact path="/course/running/" element={<><NavBar/><RunningCoursePage/></>}/>
          <Route exact path="/instr/course/running/" element={<><NavBar2/><RunningCoursePage2/></>}/>
          <Route exact path="/course/running/:dept_name/" element={<><NavBar/><DeptCoursePage/></>}/>
          <Route exact path="/instr/course/running/:dept_name/" element={<><NavBar2/><DeptCoursePage2/></>}/>
          <Route path="/course/:course_id/" element={<><NavBar/><CoursePage/></>}/>
          <Route path="/instr/course/:course_id/" element={<><NavBar2/><CoursePage2/></>}/>
          <Route path="/instructor/:instr_id/" element={<><NavBar/><InstrPage/></>}/>
          <Route path="/instr/instructor/:instr_id/" element={<><NavBar2/><InstrPage2/></>}/> */}
          <Route path ="*" element={<DefaultRedirector/>}/>
        </Routes>
    </Router>
    </>
  );
}

export default App;
