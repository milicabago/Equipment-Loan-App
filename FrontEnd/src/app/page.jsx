"use client"
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Homepage = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/auth/login');
  }, [router]);


  return (
    <Image 
    src="/keyboard.avif" alt="" layout="fill" objectFit='cover' />
  );
};

export default Homepage;