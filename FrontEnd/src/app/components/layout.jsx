
import React from 'react';
import styles from './Layout.module.css';
import Image from 'next/image'

const Layout = ({  }) => {
  return (
    <div className={styles.container}>
      <Image src="/keyboard.avif" className={styles.fixedImage} alt=""/>
      
    </div>
  );
};

export default Layout;
