import React, { useState } from "react";
import {useNavigate} from "react-router-dom"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import { apiurl } from "../config/config";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate()
  const handleLogin = async(e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);

    const data = await axios.post(`${apiurl}/login`,{
        email,password
    },{
        headers:{
            "Content-Type":"application/json"
        }
    })
    console.log("data-----",data.data)
    let token = jwtDecode(data.data.token)

    console.log("token",token);
    sessionStorage.setItem("phone",token.phone)

    if(data.status === 200){
        navigate("/chat")
    }
  };

  return (
    <div className="container vh-100 d-flex align-items-center justify-content-center">
      <div className="row w-75 shadow-lg rounded" style={{ minHeight: "400px" }}>
       
        <div className="col-md-6 d-flex align-items-center justify-content-center bg-light">
          <img
            src="https://practitioner-jv2w.vercel.app/assets/logo1-D8CjoSWO.png"
            alt="logo"
            className="img-fluid"
            style={{ maxHeight: "200px" }}
          />
        </div>

        <div className="col-md-6 p-4 d-flex flex-column justify-content-center">
          <h2 className="fw-bold">Welcome Back</h2>
          <p className="text-muted">Login to continue</p>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3 position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="position-absolute top-50 end-0 translate-middle-y me-3"
                style={{ cursor: "pointer" }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>

            <div className="mb-3 form-check">
              <input type="checkbox" className="form-check-input" id="remember" />
              <label className="form-check-label" htmlFor="remember">
                Remember this device.
              </label>
            </div>

            <button type="submit" className="btn btn-warning w-100 mb-3">
              Login
            </button>
          </form>

          <p className="text-center text-muted">
            Lost Password? <span className="text-warning" style={{ cursor: "pointer" }}>Forgot Password</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
