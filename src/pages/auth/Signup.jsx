import React from "react";
import { useState, useRef, useEffect } from "react";
import API from "../../services/api.js";
function Signup() {
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [phone, setphone] = useState("");
  const [pass, setpass] = useState("");
  const [role, setrole] = useState("");
  const [city, setcity] = useState("");
  const [conpasserror, setconpasserror] = useState("");
  const [conpass, setconpass] = useState("");
  const confirmpass = useRef();
  const [passerr, setpasserr] = useState("");
  const password = useRef();
  const [loading, setloading] = useState(false);
  useEffect(() => {
    if (conpass.length == 0) {
      setconpass("");
    } else if (confirmpass.current.value !== password.current.value) {
      setconpasserror("Password do not match");
    } else {
      setconpasserror("");
    }
  }, [conpass]);

  useEffect(() => {
    const numchar = /^.{8,}$/;
    const alphanum =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$/;

    if (!numchar.test(pass)) {
      setpasserr("Number of Characters must be atleast 8");
    } else if (!alphanum.test(pass)) {
      setpasserr(
        "Password must contain one lowercase,one upercase,one alphabet and one special character",
      );
    } else {
      setpasserr("");
    }
  }, [pass]);
  const handleSubmit = async (e) => {
     e.preventDefault();
    try {
     
      
      const phoneregex = /^[0-9]{10}$/;
      if (!phoneregex.test(phone)) {
        alert("Phone Number is not valid");
        return;
      }
      const emailregex =
        /^[a-zA-Z][a-zA-Z0-9%._+-]+[@][A-Za-z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailregex.test(email)) {
        alert("Invalid Email");
        return;
      }
      if (passerr) {
        alert("Invalid Password");
        return;
      }

      if (password.current.value !== confirmpass.current.value) {
        alert("Passwords do not match");
        return;
      }
      setloading(true);
      const res = await API.post("/users/register", {
        name,
        email,
        phone,
        password: pass,
        role,
        city,
      });
      console.log(res.data);
    } catch (error) {
      console.log("Error Occured", error.response?.data);
    } finally {
      setloading(false);
    }
  };

  console.log(role);
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="container bg-gray-300 flex flex-col items-center ">
          <h1 className="font-bold text-4xl">Signup</h1>
          <div className="font-black text-2xl">
            <label htmlFor="Name">Full Name</label>
            <input
              type="text"
              name="Name"
              placeholder="Name"
              className="bg-gray-400 w-[50vh] h-10 text-center"
              required
              value={name}
              onChange={(e) => {
                setname(e.target.value);
              }}
            />
          </div>
          <div className="font-black text-2xl">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="bg-gray-400 w-[50vh] h-10 text-center"
              required
              value={email}
              onChange={(e) => {
                setemail(e.target.value);
              }}
            />
          </div>
          <div className="font-black text-2xl">
            <label htmlFor="Phone">Phone Number</label>
            <input
              type="tel"
              name="Phone"
              placeholder="Phone "
              minLength={10}
              maxLength={10}
              className="bg-gray-400 w-[50vh] h-10 text-center"
              required
              value={phone}
              onChange={(e) => {
                setphone(e.target.value);
              }}
            />
          </div>
          <div className="font-black text-2xl">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              ref={password}
              placeholder="Password"
              className="bg-gray-400 w-[50vh] h-10 text-center"
              required
              value={pass}
              onChange={(e) => {
                setpass(e.target.value);
              }}
            />
            <br />
            {passerr && (
              <p className="text-lg text-red-500 text-center">{passerr}</p>
            )}
          </div>
          <div className="font-black text-2xl">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              ref={confirmpass}
              type="password"
              name="confirmPassword"
              placeholder="confirmPassword"
              className="bg-gray-400 w-[50vh] h-10 text-center"
              required
              value={conpass}
              onChange={(e) => {
                setconpass(e.target.value);
              }}
            />
            <br />
            {conpasserror && (
              <p className="text-lg text-center text-red-500">{conpasserror}</p>
            )}
          </div>
          <div className="font-black text-2xl">
            <label htmlFor="city">City</label>
            <input
              type="text"
              name="city"
              placeholder="City"
              className="bg-gray-400 w-[50vh] h-10 text-center"
              required
              value={city}
              onChange={(e) => {
                setcity(e.target.value);
              }}
            />
          </div>
          <div className="font-black text-2xl">
            <label htmlFor="Role">Role</label>
            <select
              name="Role"
              id=""
              value={role}
              onChange={(e) => {
                setrole(e.target.value);
              }}
            >
              <option value="" disabled>
                Select
              </option>
              <option value="Donor">Donor</option>
              <option value="Receiver">Receiver</option>
            </select>
          </div>
          <div>
            <button type="submit" disabled={loading}>
              Sign Up
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Signup;
