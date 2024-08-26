"use client";
import styles from './page.module.css'
import Image from "next/image";
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import { useRouter } from "next/navigation";
import axios from 'axios';
import toast from 'react-hot-toast';



const RegisterPage = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const schema = yup.object().shape({
        first_name: yup.string().required("First name is required!").matches(/^(\S+\s)*\S+$/, '"First name" cannot contain multiple consecutive spaces!'),
        last_name: yup.string().required("Last name is required!").matches(/^(\S+\s)*\S+$/, '"Last name" cannot start or end with spaces, or contain multiple consecutive spaces!'),
        username: yup.string().required("Username is required!").min(3).max(30).matches(/^[a-zA-Z0-9]+$/, '"Username" can only contain letters and numbers!'),
        contact: yup.string().notRequired("Contact is not required!").matches(/^(\+\d{1,3})?\d{9,15}$/, 'Contact must be a valid phone number'),
        email: yup.string().email().required("Email is required!").matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, '"Email" is not valid!'),
        role: yup.string().required("Role is required!").oneOf(["admin", "user"], 'Invalid "role" value!'),
        password: yup.string().min(8, "Password must be at least 8 characters long").required("Password is required!"),
        confirm_password: yup.string().oneOf([yup.ref("password"), null], "Passwords don't match").required("Please confirm your password")

    });
    
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
    });
    
    const onSubmit = (data) => {
        axios.post(process.env.NEXT_PUBLIC_BASE_URL + "register", {
                first_name: data.first_name,
                last_name: data.last_name,
                username: data.username,
                email: data.email,
                password: data.password,
                contact: data.contact,
            })
            .then(() =>{
                router.push('/auth/login');
            })
            .catch((error) => {
                toast.error(error.response.data.message);
        });
    };
    const handleLogin = () => {
        router.push("/auth/login");
    };


    return(
        <div className={styles.container}>
            <link rel="icon" href="/favicon.ico" /> 
            
            <div className={styles.background}>
                <Image 
                    src="/keyboard.avif" alt="" layout="fill" 
                    objectFit='cover' />
                <div className={styles.box}>
                <form onSubmit={handleSubmit(onSubmit)} action="" className={styles.form}>
                    <div className={styles.start}>
                        <span className={styles.title}>Equipment Loan</span>
                        <span className={styles.desc} >Register!</span> 
                    </div>
                    <div className={styles.field}>
                    <label className={styles.firstName}>First Name:
                    <p>{errors.first_name?.message}</p>
                        <input type="text" className={styles.autofill} placeholder="Enter first name" {...register("first_name")} autoComplete="off" />
                    </label>  

                    <label className={styles.lastName}>Last Name:
                    <p>{errors.last_name?.message}</p>
                        <input type="text" className={styles.autofill} placeholder="Enter last name" {...register("last_name")} autoComplete="off" />
                    </label>

                    <label className={styles.username}>Username:
                    <p>{errors.username?.message}</p>
                        <input type="text" className={styles.autofill} placeholder="Enter username" {...register("username")} autoComplete="off" />
                    </label>

                    <label className={styles.contact}>Contact:
                    <p>{errors.contact?.message}</p>
                    <input
                        type="tel"
                        onKeyDown={(event) => {
                            const key = event.key; 
                            const value = event.target.value;
                            const regex = /^\+?\d*$/;
                            if (!regex.test(value + key) && key !== "Backspace" && key !== "Delete") {
                                event.preventDefault(); 
                            }
                        }}
                        placeholder="Enter contact number"
                        {...register("contact")}
                        autoComplete='off'/>
                    </label> 
                    

                    <label className={styles.email}>Email:
                    <p>{errors.email?.message}</p>
                        <input type="text" className={styles.autofill} placeholder="Enter email" {...register("email")} autoComplete="off" />
                    </label>

                    <label className={styles.password}>Password:
                    <p>{errors.password?.message}</p>
                        <div className={styles.passwordInputContainer}>
                            <input 
                                type={showPassword ? "text" : "password"} placeholder="Enter password" {...register("password")} autoComplete="off"/>
                            <span className={styles.passwordToggle} onClick={togglePasswordVisibility}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </label>

                    <label className={styles.confirmPassword}>Confirm Password:
                    <p>{errors.confirm_password?.message}</p>
                        <div className={styles.passwordInputContainer}>
                            <input 
                                type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password" {...register("confirm_password")} autoComplete="off"/>
                            <span className={styles.passwordToggle} onClick={toggleConfirmPasswordVisibility}>
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </label>
                    </div>
                    <div className={styles.btn}>
                        <button type="submit">Register</button>
                        <p className={styles.par}>Already have an account? {""} <a onClick={handleLogin} className={styles.login}>Login here</a></p>                   
                    </div>
                </form> 
                </div>
            </div>
        </div> 
    );
};

export default RegisterPage;
