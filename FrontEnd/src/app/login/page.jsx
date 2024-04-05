"use client";
import styles from './page.module.css'
import Image from "next/image";
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import axios from 'axios';

<link rel="icon" href="/favicon.ico" /> 

const LoginPage = (data) => {

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const schema = yup.object().shape({
        username: yup.string().required("Username is required"),
        password: yup.string().required("Password is required"),
    });
    
    const{ register, handleSubmit, formState: {errors }} = useForm({
        resolver: yupResolver(schema)
    });

    const onSubmit = (data, e) => {
        e.preventDefault();
        axios
          .post(process.env.NEXT_PUBLIC_BASE_URL + "/login", data)
          .then((response) => {
            const accessToken = response.data.accessToken;
            setCookie("token", accessToken);
            axios
              .get(process.env.NEXT_PUBLIC_BASE_URL + "/current", {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              })
              .then((userResponse) => {
                setUser(userResponse.data);
                router.push("/admin/page.jsx");
              })
              .catch((error) => {
                console.error("Error fetching user data:", error);
              });
          })
          .catch((error) => {
            alert("Invalid email or password");
          });
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
                <input type="text" className={styles.autofill} placeholder="Unesite email ili korisničko ime" {...register("username")} autoComplete="off" /></label>  

                <label className={styles.password}>Lozinka:
                    <div className={styles.passwordInputContainer}>
                        <input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Unesite lozinku" 
                            {...register("password")}  
                            autoComplete="off"
                        />
                        <span className={styles.passwordToggle} onClick={togglePasswordVisibility}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </label>

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

export default LoginPage;

