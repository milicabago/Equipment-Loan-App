"use client";
import styles from "@/app/ui/login/login.module.css";
import Image from "next/image";
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";

<link rel="icon" href="/favicon.ico" /> 

const LoginPage = (data) => {

    const schema = yup.object().shape({
        username: yup.string().required("Username is required"),
        password: yup.string().required("Password is required"),
    });
    
    const{ register, handleSubmit, formState: {errors}} = useForm({
        resolver: yupResolver(schema)
    });

    const onSubmit = () => {
        console.log(data);
    };

    return(
        <div className={styles.container}>
            
            <div className={styles.bgi}>
            <Image 
                src="/keyboard.avif" alt="" layout="fill" 
                objectFit='cover' />
            
            <form onSubmit={handleSubmit(onSubmit)} action="" className={styles.form}>
                <div className={styles.start}>
                    <span className={styles.title}>Equipment-Loan</span>
                    <span className={styles.desc} >Prijavi se!</span> 
                </div>
                

                <label className={styles.username}>Korisničko ime:
                {/* <p>{errors.username?.message}</p>*/}
                <input type="text" placeholder="Unesite email ili korisničko ime" {...register("username")} autoComplete='off' /></label>  

                <label className={styles.password}>Lozinka:
                <input type="password" placeholder="Unesite lozinku" {...register("password")} autoComplete='off'/></label>

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

