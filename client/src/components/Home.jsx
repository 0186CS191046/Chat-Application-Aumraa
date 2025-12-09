import React, { useState, useEffect } from "react";
import { socket } from "../config/socket";
import Navbar from "./Navbar";
import Userlist from "./Userlist";

const Home = () => {
    return(<>
    <Navbar/>
    <Userlist/>
    </>)
}

export default Home;