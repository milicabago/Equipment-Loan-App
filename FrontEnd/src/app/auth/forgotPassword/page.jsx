"use client"
import { useState } from 'react';
import { useRouter } from "next/navigation";
import axios from 'axios';
import Image from "next/image";
import toast from 'react-hot-toast';
import styles from './page.module.css'; 

const ForgotPasswordPage = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(process.env.NEXT_PUBLIC_BASE_URL + "forgotPassword", { email });
            toast.success("Reset password link sent to your email.");
        } catch (error) {
            console.error("Forgot password error:", error.response.data.message);
            toast.error(error.response.data.message);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.background}>
            <Image 
                src="/keyboard.avif" alt="" layout="fill" 
                objectFit='cover' />
            

                <form onSubmit={handleSubmit} action="" className={styles.form}>
                    <div className={styles.start}>
                        <span className={styles.title}>Forgot Password</span>
                        <span className={styles.desc}>Enter your email and we'll send you a link to reset your password.</span>
                    </div>
                    <label className={styles.email}>Email:
                        <input 
                            type="email" 
                            placeholder="Enter your email" 
                            value={email} 
                            onChange={handleEmailChange} 
                            autoComplete="off" 
                        />
                    </label>
                    <div className={styles.btn}>
                        <button type="submit">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
