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
    confirmPassword: yup.string()
        .oneOf([yup.ref("password"), null], "Passwords must match") 
        .required("Confirm password is required"),
});
    
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });
    
    const onSubmit = async (data) => {
        try {
            const pathSegments = window.location.pathname.split("/");
            const userId = pathSegments[pathSegments.length - 2];
            const token = pathSegments.pop();
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
    
            const response = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL + `resetPassword/${userId}/${token}`, { newPassword: data.password }, config);
            
            if (response.status === 200) {
                toast.success("Password reset successful!", { duration: 3000 });
                setTimeout(() => {
                    router.push("/auth/login");
                }, 3000);
            } else {
                toast.error("Password reset failed. Please try again later.");
            }
        } catch (error) {
            console.error("Password reset error:", error);
            if (error.response) {
                toast.error('token' +error.response.data.message);
            } else {
                toast.error("Password reset failed. Please try again later.");
            }
        }
    };


    return (
        <div className={styles.container}>
            <link rel="icon" href="/favicon.ico" /> 
            <div className={styles.background}>
                <Image src="/keyboard.avif" alt="" layout="fill" objectFit='cover' />
                <form onSubmit={handleSubmit(onSubmit)} action="" className={styles.form}>
                    <div className={styles.start}>
                        <span className={styles.title}>Reset Password</span>
                        <span className={styles.desc}>Now you can reset your password by entering your new password.</span> 
                    </div>
                    <label className={styles.password}>Password:
                    <p>{errors.password?.message}</p>

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
                        
                    </label>
                    <label className={styles.password}>Confirm Password:
                    <p>{errors.confirmPassword?.message}</p>
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
