
import React from "react";

const Hero = () => {
  return (
    <section id="home" className="relative w-full h-screen overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/luxury-sfs-spinning.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4 text-yellow-200 bg-black/60 backdrop-blur-sm">
        <img
          src="/sfs-logo.png"
          alt="SmartFlow Logo"
          className="w-24 h-24 mb-4 rounded-full border-2 border-yellow-300 shadow-lg"
        />
        <h1 className="text-5xl md:text-6xl font-bold text-yellow-300 mb-4">
          SmartFlow Systems
        </h1>
        <p className="text-lg md:text-xl text-yellow-100 mb-8 max-w-xl">
          From booking to eCommerce — build your business with class, style, and flow.
        </p>
        <div className="flex gap-4">
          <a
            href="https://boweazy.github.io/smartflow-ecommerce-demo/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border-2 border-yellow-400 text-yellow-300 rounded hover:bg-yellow-400 hover:text-black transition"
          >
            View Demo
          </a>
          <a
            href="#contact"
            className="px-6 py-3 border-2 border-yellow-400 text-yellow-300 rounded hover:bg-yellow-400 hover:text-black transition"
          >
            Book Now
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
