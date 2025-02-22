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
import toast from 'react-hot-toast';

const LoginPage = () => {
    const router = useRouter();
    const [cookies, setCookie, removeCookie]  = useCookies(['accessToken']);
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    
    const schema = yup.object().shape({
        email: yup.string().required("Email is required"),
        password: yup.string().min(8).required("Password is required"),
    });

    const{ register, handleSubmit, formState: {} } = useForm({
        resolver: yupResolver(schema)
    });

    const clearHistory = () => {
        window.history.pushState(null, '', window.location.href);
        window.history.forward();
    };
    
    useEffect(() => {
        removeCookie('accessToken');
        localStorage.clear();
    }, [removeCookie]);

    useEffect(() => {
        const token = cookies.accessToken; 
        let userRole = null;

        if (token) {
            try {
            const decodedToken = jwtDecode(token); 
            userRole = decodedToken.user.role; 
            } catch (error) {
            console.log(error);
            }
            if (userRole === 'admin') {
            router.push('/admin');
            } else if (userRole === 'user') {
            router.push('/user');
            }
        }
    }, [cookies.accessToken, router]);
    
    const handleForgotPassword = () => {
        router.push("/auth/forgotPassword");
    };
   
    const onSubmit = (data) => {
        axios
            .post(process.env.NEXT_PUBLIC_BASE_URL + "login", data)
            .then((response) => {
                console.log("Logged in successfully!");
                const token = response.data.accessToken;
                const decodedToken = jwtDecode(token); 
                const userRole = decodedToken.user.role;
                
                const userId = decodedToken.user._id;  
                console.log("Stored userId:", userId); 
                localStorage.setItem('userId', userId); 

                setCookie ('accessToken', token);
                if (userRole === "admin") {
                    router.push("/admin");
                } else if (userRole === "user") {
                    router.push("/user");
                }
                clearHistory();
            })
            .catch((error) => {
                toast.error(error.response.data.message , {duration: 3000});
            });
        };

    return(
        <div className={styles.container}>
            <link rel="icon" href="/favicon.ico" /> 
            
            <div className={styles.background}>
            <Image 
                src="/keyboard.avif" alt="" layout="fill" 
                objectFit='cover' />
            
            <form onSubmit={handleSubmit(onSubmit)} action="" className={styles.form}>
                <div className={styles.start}>
                    <span className={styles.title}>Equipment Loan</span>
                    <span className={styles.description} >Please login to your account.</span> 
                </div>

                <label className={styles.email}>Email:
                <input type="text" className={styles.autofill} placeholder="Enter your email" {...register("email")} autoComplete="off" /></label>  

                <label className={styles.password}>Password:
                    <div className={styles.passwordInputContainer}>
                        <input 
                            type={showPassword ? "text" : "password"} placeholder="Enter your password" {...register("password")} autoComplete="off"/>
                        <span className={styles.passwordToggle} onClick={togglePasswordVisibility}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </label>

                <div className={styles.button}>
                    <button type="submit">Login</button>
                    <p className={styles.p}>Forgot Password? {""} <a onClick={handleForgotPassword} className={styles.forgot}>Reset here to reset</a></p>
                </div>   
            </form> 
            </div>
        </div> 
    );
};

export default LoginPage;