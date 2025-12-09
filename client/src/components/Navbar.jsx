import React from "react";

const Navbar = () => {
  return (
    <nav className="navbar navbar-light bg-light">
      <div className="container-fluid d-flex align-items-center">
        {/* Logo */}
        <img
          src="https://practitioner-jv2w.vercel.app/assets/logo1-D8CjoSWO.png"
          alt="logo"
          width="60"
          height="60"
          className="rounded-circle me-3"
        />

        {/* Title */}
        <h1 className="m-0">Aumraa Chat Application</h1>
      </div>
    </nav>
  );
};

export default Navbar;
