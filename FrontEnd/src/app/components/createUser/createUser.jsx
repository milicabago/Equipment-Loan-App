"use client";
import styles from './createUser.module.css';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import { useState, useEffect} from 'react';
import toast from 'react-hot-toast';
    
const schema = yup.object().shape({
    first_name: yup.string().required("First name is required!").matches(/^(\S+\s)*\S+$/, '"First name" cannot contain multiple consecutive spaces!'),
    last_name: yup.string().required("Last name is required!").matches(/^(\S+\s)*\S+$/, '"Last name" cannot start or end with spaces, or contain multiple consecutive spaces!'),
    email: yup.string().email().required("Email is required!").matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, '"Email" is not valid!'),
    username: yup.string().required("Username is required!").min(3).max(30).matches(/^[a-zA-Z0-9]+$/, '"Username" can only contain letters and numbers!'),
    role: yup.string().required("Role is required!").oneOf(["admin", "user"], 'Invalid "role" value!'),
    contact: yup.string().notRequired("Contact is required!").matches(/^(\+\d{1,3})?\d{9,15}$/, 'Contact must be a valid phone number'),
    position: yup.string().required("Position is required!").matches(/^(\S+\s)*\S+$/, '"Position" cannot start or end with spaces, or contain multiple consecutive spaces!'),
    password: yup.string().min(8, "Password must be at least 8 characters long").required("Password is required!"),
    confirm_password: yup.string().oneOf([yup.ref("password"), null], "Passwords don't match").required("Please confirm your password")

});

const Users = (data) => {
    const [createdUser, setCreatedUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };
    
    const{register, handleSubmit, formState: {errors}, reset} = useForm({
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        if (createdUser) {
            const timer = setTimeout(() => {
                window.location.reload()
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [createdUser]);

    const onSubmit = async (data) => {
        try {
            let token = document.cookie
                .split('; ')
                .find(row => row.startsWith('accessToken'))
                .split('=')[1];
                const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}admin/createUser`, {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    username: data.username,
                    contact: data.contact,
                    email: data.email,
                    password: data.password,
                    role: data.role,
                    position: data.position,
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                toast.success('User has been successfully created.', { duration: 3000 });
                setCreatedUser(data);
        } catch (error) {
            toast.error(error.response.data.message , { duration: 3000 });
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.form}> 
            <form onSubmit={handleSubmit(onSubmit)} action="" className={styles.form}>
                    <div className={styles.start}>
                        <span className={styles.title}>User Personal Information</span>
                        <span className={styles.desc}> </span> 
                    </div>
                    <label className={styles.firstname}>First Name:
                    <p>{errors.first_name?.message}</p>
                    <input type="text" placeholder="Enter first name" {...register("first_name")}  autoComplete='off'/></label>
                    
                    <label className={styles.lastname}>Last Name:
                    <p>{errors.last_name?.message}</p>
                    <input type="text" placeholder="Enter last name" {...register("last_name")} autoComplete='off'/></label>
                    
                    <label className={styles.username}>Username:
                    <p>{errors.username?.message}</p>
                    <input type="text" placeholder="Enter username" {...register("username")} autoComplete='off'/></label>
                    
                    <label className={styles.contact}>Contact:
                    <p>{errors.contact?.message}</p>
                    <input type="tel" 
                    onKeyPress={(event) => {
                        const keyCode = event.keyCode || event.which;
                        const keyValue = String.fromCharCode(keyCode);
                        const value = event.target.value;
                        const regex = /^\+?\d*$/; 
                        if (!regex.test(value + keyValue)) {
                            event.preventDefault();
                        }
                    }} placeholder="Enter contact number" {...register("contact")} autoComplete='off'/></label> 
                    
                    <label className={styles.email}>Email Address:
                    <p>{errors.email?.message}</p>
                    <input type="email" placeholder="Enter email" {...register("email")} autoComplete='off'/></label>

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
                    
                    <label className={styles.role}>Role:
                    <select {...register("role")} className={styles.select} defaultValue="user">
                            <option  className={styles.admin} value="admin">Administrator</option>
                            <option className={styles.user} value="user">User</option>
                        </select>
                    </label> 

                    <label className={styles.position}>Position:
                    <select {...register("position")} className={styles.select}>
                        <option className={styles.employee} value="Project manager">Project manager</option>
                        <option className={styles.employee} value="Software developer">Software developer</option>
                        <option className={styles.employee} value="Graphic designer">Graphic designer</option>
                        <option className={styles.employee} value="Financial accountant">Financial accountant</option>
                        <option className={styles.employee} value="DevOps Engineer">DevOps Engineer</option>
                        <option className={styles.employee} value="Junior Product Owner">Junior Product Owner</option>
                    </select>
                    </label> 
                    <div>
                        <button className={styles.button} type="submit">Create</button>
                    </div>
                </form>
            </div>            
        </div>
    );
};

export default Users;