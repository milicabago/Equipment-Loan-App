"use client";
import { usePathname } from 'next/navigation';
import styles from './navbar.module.css';


const Navbar = () => {

    const pathname = usePathname();

    return(
        <div className={styles.container}>
            
            <div className={styles.title}>Equipment Loan Manager</div>
            <div className={styles.menu}>
            </div>
        </div>
    );
};

export default Navbar;