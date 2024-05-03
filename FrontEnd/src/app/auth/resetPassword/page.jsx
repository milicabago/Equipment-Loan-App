"use client";import styles from './page.module.css'
import Image from "next/image";
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import { useRouter } from "next/navigation";
import axios from 'axios';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const schema = yup.object().shape({
        password: yup.string().min(8).required("Password is required"),
        confirmPassword: yup.string().oneOf([yup.ref("password"), null], "Passwords don't match").required("Confirm password is required"),
    });
    
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });

    const onSubmit = (data) => {
        const token = router.query.token; 
        axios
            .post(process.env.NEXT_PUBLIC_BASE_URL + "resetPassword", { password: data.password, token })
            .then(() => {
                console.log("Password reset successful!");
                toast.success("Password reset successful!");
                router.push("/login");
            })
            .catch((error) => {
                console.error("Password reset error:", error.response.data.message);
                toast.error(error.response.data.message);
            });
    };

    return (
        <div className={styles.container}>
            <link rel="icon" href="/favicon.ico" /> 
            <div className={styles.background}>
                <Image src="/keyboard.avif" alt="" layout="fill" objectFit='cover' />
                <form onSubmit={handleSubmit(onSubmit)} action="" className={styles.form}>
                    <div className={styles.start}>
                        <span className={styles.title}>Reset Password</span>
                        <span className={styles.desc}></span> 
                    </div>
                    <label className={styles.password}>Password:
                        <div className={styles.passwordInputContainer}>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Enter your new password" 
                                {...register("password")} 
                                autoComplete="off"
                            />
                            <span className={styles.passwordToggle} onClick={togglePasswordVisibility}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <p className={styles.error}>{errors.password?.message}</p>
                    </label>
                    <label className={styles.password}>Confirm Password:
                        <div className={styles.passwordInputContainer}>
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder="Confirm your new password" 
                                {...register("confirmPassword")} 
                                autoComplete="off"
                            />
                            <span className={styles.passwordToggle} onClick={toggleConfirmPasswordVisibility}>
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <p className={styles.error}>{errors.confirmPassword?.message}</p>
                    </label>
                    <div className={styles.btn}>
                        <button type="submit">Reset Password</button>
                    </div>
                </form> 
            </div>
        </div>
    );
};

export default ResetPasswordPage;
