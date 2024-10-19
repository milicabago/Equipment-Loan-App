"use client"
import Login from './auth/login/page';
import Image from "next/image";

const Homepage = () => {
  return (
    <div>
      <Image 
        src="/keyboard.avif" alt="" layout="fill" 
        objectFit='cover' />
      <Login/>
    </div>
  );
};

export default Homepage;