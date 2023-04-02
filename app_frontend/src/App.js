// import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/Login';
import Register from './Components/Register';
// import Home from './Components/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/register" element={<Register />} />

        {/* <Route exact path = "/home" element = {<Home />} /> */}


        <Route path="*" element={<Login /> }/>


      </Routes>
    </Router>
  );
}

export default App;
