"use client";
import styles from './page.module.css'
import Image from "next/image";
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import { useRouter } from "next/navigation";
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';


const LoginPage = (data) => {
    const [role, setRole] = useState(null);
    const router = useRouter();
    const [cookies, setCookies] = useCookies(['accessToken']);

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const schema = yup.object().shape({
        email: yup.string().required("Email is required"),
        password: yup.string().min(8).required("Password is required"),
    });
    
    const{ register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });

    const clearHistory = () => {
        window.history.pushState(null, '', window.location.href);
        window.history.forward();
    };

    useEffect(() => {
        const token = cookies.accessToken; 
        if (token) {
          const decodedToken = jwtDecode(token); 
          const id = decodedToken.user._id;
          const userRole = decodedToken.user.role; 

          if (userRole === 'admin') {
                router.push('/admin');
            } else if (userRole === 'user') {
                router.push('/user');
            }
        }
      }, [cookies.accessToken]);
    
    
    const onSubmit = (data) => {
        axios
            .post(process.env.NEXT_PUBLIC_BASE_URL + "/login", data)
            .then((response) => {
                console.log("Logged in successfully!");
                const token = response.data.accessToken;
                const decodedToken = jwtDecode(token); 
                const userRole = decodedToken.user.role; 

                setCookies('accessToken', token);
                window.localStorage.setItem('user._id', decodedToken.user._id);

                if (userRole === "admin") {
                    router.push("/admin");
                } else if (userRole === "user") {
                    router.push("/user");
                }
                clearHistory();
            })
            .catch((error) => {
                console.error("Login error:", error.response.data.message);
                alert("Invalid email or password");
            });
        };

    return(
        <div className={styles.container}>
            <link rel="icon" href="/favicon.ico" /> 
            
            <div className={styles.bgi}>
            <Image 
                src="/keyboard.avif" alt="" layout="fill" 
                objectFit='cover' />
            
            <form onSubmit={handleSubmit(onSubmit)} action="" className={styles.form}>
                <div className={styles.start}>
                    <span className={styles.title}>Equipment Loan</span>
                    <span className={styles.desc} >Prijavi se!</span> 
                </div>
                

                <label className={styles.email}>Email:
                <input type="text" className={styles.autofill} placeholder="Unesite email" {...register("email")} autoComplete="off" /></label>  

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