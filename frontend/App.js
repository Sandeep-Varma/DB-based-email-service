// import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import SignUp from './Components/signup';
import LoginUser from './Components/login';
import MailPage from './Components/mailbox';
import ComposePage from './Components/compose';
import DefaultRedirector from './Components/default';

const App = ()=>{
  return (
    <>
    <Router forceRefresh={true}>
        <Routes>
          <Route exact path="/login" element={<LoginUser/>}/>
          <Route exact path="/signup" element={<SignUp/>}/>
          <Route exact path="/mail/:box" element={<MailPage/>}/>
          <Route exact path="/mail/compose/:num" element={<ComposePage/>}/>
          <Route path ="*" element={<DefaultRedirector/>}/>
        </Routes>
    </Router>
    </>
  );
}

export default App;
