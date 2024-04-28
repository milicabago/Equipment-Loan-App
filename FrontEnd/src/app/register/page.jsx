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
        first_name: yup.string().required("First name is required!"),
        last_name: yup.string().required("Last name is required!"),
        username: yup.string().required("Username is required!"),
        email: yup.string().email().required("Email is required!"),
        password: yup.string().min(8).required("Password is required"),
        confirm_password: yup.string().oneOf([yup.ref("password"), null], "Passwords don't match").required(),        
    });
    
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
    });
    
    const onSubmit = (data) => {
        axios.post(process.env.NEXT_PUBLIC_BASE_URL + "register", {
                first_name: data.first_name,
                last_Name: data.last_name,
                username: data.username,
                email: data.email,
                password: data.password,
                position: data.position
            })
            .then(() =>{
                router.push('/login');
            })
            .catch((error) => {
                console.error("Registration error:", error.response ? error.response.data.message : error.message);
        });
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
                        <span className={styles.desc} >Registriraj se!</span> 
                    </div>
                    <div className={styles.field}>
                    <label className={styles.firstName}>Ime:
                    <p>{errors.first_name?.message}</p>
                        <input type="text" className={styles.autofill} placeholder="Unesite ime" {...register("first_name")} autoComplete="off" />
                    </label>  

                    <label className={styles.lastName}>Prezime:
                    <p>{errors.last_name?.message}</p>
                        <input type="text" className={styles.autofill} placeholder="Unesite prezime" {...register("last_name")} autoComplete="off" />
                    </label>

                    <label className={styles.username}>Korisničko ime:
                    <p>{errors.username?.message}</p>
                        <input type="text" className={styles.autofill} placeholder="Unesite korisničko ime" {...register("username")} autoComplete="off" />
                    </label>

                    <label className={styles.email}>Email:
                    <p>{errors.email?.message}</p>
                        <input type="text" className={styles.autofill} placeholder="Unesite email" {...register("email")} autoComplete="off" />
                    </label>

                    <label className={styles.password}>Lozinka:
                    <p>{errors.Password?.message}</p>
                        <div className={styles.passwordInputContainer}>
                            <input 
                                type={showPassword ? "text" : "password"} placeholder="Unesite lozinku" {...register("password")} autoComplete="off"/>
                            <span className={styles.passwordToggle} onClick={togglePasswordVisibility}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </label>

                    <label className={styles.confirmPassword}>Potvrdite lozinku:
                    <p>{errors.Confirm_password?.message}</p>
                        <div className={styles.passwordInputContainer}>
                            <input 
                                type={showConfirmPassword ? "text" : "password"} placeholder="Potvrdite lozinku" {...register("confirm_password")} autoComplete="off"/>
                            <span className={styles.passwordToggle} onClick={toggleConfirmPasswordVisibility}>
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </label>

                    <label className={styles.position}>Pozicija:
                                <p>{errors.position?.message}</p>
                                <select {...register("position")} className={styles.select}>
                                    <option value="">Odaberi poziciju</option>
                                    <option className={styles.employee} value="1">Project manager</option>
                                    <option className={styles.employee} value="2">Software developer</option>
                                    <option className={styles.employee} value="3">Graphic designer</option>
                                    <option className={styles.employee} value="4">Financial accountant</option>
                                    <option className={styles.employee} value="5">DevOps Engineer</option>
                                    <option className={styles.employee} value="6">Junior Product Owner</option>
                                </select>
                            </label>

                   

                    


                    <div className={styles.btn}>
                        <button type="submit">Register</button>
                    </div>
                    </div>
                </form> 
                </div>
            </div>
        </div> 
    );
};

export default RegisterPage;
