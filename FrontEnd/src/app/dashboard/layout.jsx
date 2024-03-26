import React from 'react';
import Sidebar from '../ui/dashboard/sidebar/sidebar';
import Navbar from '../ui/dashboard/navbar/navbar';
import styles from '../ui/dashboard/dashboard.module.css';
import Image from 'next/image';
/*import Footer from '../ui/dashboard/footer/footer';*/

const Layout = ({children}) => {
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
                        {children}
                    </div>
                    
                </div>
                
            </div>
            <div>
                
            </div>
            
        </div>
    )
}

export default Layout;

/*<div className={styles.footer}>
                    <Footer/>
            </div>   */