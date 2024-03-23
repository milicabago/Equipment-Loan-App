import styles from "@/app/ui/login/login.module.css";
import Image from "next/image";

<link rel="icon" href="/favicon.ico" /> 

const LoginPage = () => {



    return(
        <div className={styles.container}>
            
            <div className={styles.bgi}>
            <Image 
                src="/keyboard.avif" alt="" layout="fill" 
                objectFit='cover' />
            
            <form action="" className={styles.form}>
                <div className={styles.start}>
                    <span className={styles.title}>Equipment-Loan</span>
                    <span className={styles.desc} >Prijavi se!</span> 
                </div>


                <label className={styles.username}>Korisničko ime:
                <input type="text" placeholder="Unesite email ili korisničko ime" /></label>  
                <label className={styles.password}>Lozinka:
                <input type="password" placeholder="Unesite lozinku"/></label>

                <div className={styles.btn}>
                      
                    <div className={styles.box}>
                        <label className={styles.checkbox}> 
                        <input type="checkbox" name=""/>Zapamti me</label>
                        <a href="/mail.jsx" className={styles.forgot}>Zaboravili ste lozinku?</a>
                    </div>
                    
                    <button type="submit">Prijava</button>
                </div>   
            </form> 
            </div>
        </div> 
    );
};

export default LoginPage

