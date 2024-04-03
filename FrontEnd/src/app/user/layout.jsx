import React from 'react';
import styles from '../components/components.module.css';
import Sidebar from './sidebar/sidebar';
import Navbar from './navbar/navbar';
import Rightbar from './rightbar/rightbar';
import Image from 'next/image';

const Layout = ({ children }) => {
    return(
        <div className={styles.bgi}>
            <Image src="/keyboard.avif" alt="" layout="fill" objectFit="cover"/>
            <div className={styles.container}>

                <div className={styles.menu}>
                    <Sidebar/>
                </div>


                <div className={styles.content}>

                    <div className={styles.nav}>
                        <Navbar/>

                    </div>

                    <div className={styles.main}>

                        <div className={styles.board}>
                            {children}
                        

                        </div>
                        <div className={styles.rightbar}>
                            <Rightbar/>
                        </div>

                    </div>

                </div>
                



                
            </div>
        </div>

       
    );
};

export default Layout;