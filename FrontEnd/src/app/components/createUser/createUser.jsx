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
        first_name: yup.string().required("First name is required!"),
        last_name: yup.string().required("Last name is required!"),
        username: yup.string().required("Username is required!"),
        contact: yup.string().required("Contact is required!"),
        email: yup.string().email().required("Email is required!"),
        password: yup.string().min(8).required("Password is required"),
        confirm_password: yup.string().oneOf([yup.ref("password"), null], "Passwords don't match").required(),
        position: yup.string().required("Position is required!"),
        role: yup.string().required("Role is required!")
        
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
          if (error.response && error.response.data) {
            
              toast.error(error.response.data.message, { duration: 3000 }); 
          } else {
              toast.error('Failed to create user!', { duration: 3000 });
          }
      }
  };


    return (
        <div className={styles.container}>

            <div className={styles.form}> 
            <form onSubmit={handleSubmit(onSubmit)} action="" className={styles.form}>
                    <div className={styles.start}>
                        <span className={styles.title}>Osobni podaci korisnika</span>
                        <span className={styles.desc}> </span> 
                    </div>

                    <label className={styles.firstname}>Ime:
                    <p>{errors.first_name?.message}</p>
                    <input type="text" placeholder="Unesite ime" {...register("first_name")}  autoComplete='off'/></label>
                    
                    <label className={styles.lastname}>Prezime:
                    <p>{errors.last_name?.message}</p>
                    <input type="text" placeholder="Unesite prezime" {...register("last_name")} autoComplete='off'/></label>
                    
                    <label className={styles.username}>Korisničko ime:
                    <p>{errors.username?.message}</p>
                    <input type="text" placeholder="Unesite korisničko ime" {...register("username")} autoComplete='off'/></label>
                    
                    <label className={styles.contact}>Kontakt:
                    <p>{errors.contact?.message}</p>
                    <input type="string" placeholder="Unesite kontakt broj" {...register("contact")} autoComplete='off'/></label> 
                    
                    <label className={styles.email}>Email adresa:
                    <p>{errors.email?.message}</p>
                    <input type="email" placeholder="Unesite email" {...register("email")} autoComplete='off'/></label>

                    <label className={styles.password}>Lozinka:
                    <p>{errors.password?.message}</p>
                        <div className={styles.passwordInputContainer}>
                            <input 
                                type={showPassword ? "text" : "password"} placeholder="Unesite lozinku" {...register("password")} autoComplete="off"/>
                            <span className={styles.passwordToggle} onClick={togglePasswordVisibility}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </label>

                    <label className={styles.confirmPassword}>Potvrdite lozinku:
                    <p>{errors.confirm_password?.message}</p>
                        <div className={styles.passwordInputContainer}>
                            <input 
                                type={showConfirmPassword ? "text" : "password"} placeholder="Potvrdite lozinku" {...register("confirm_password")} autoComplete="off"/>
                            <span className={styles.passwordToggle} onClick={toggleConfirmPasswordVisibility}>
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </label>
                    
                    <label className={styles.role}>Uloga:
                    
                    <select {...register("role")} className={styles.select} defaultValue="user">
                            <option  className={styles.admin} value="admin">Administrator</option>
                            <option className={styles.user} value="user">Uposlenik</option>
                        </select>
                    </label> 

                    <label className={styles.position}>Pozicija:
                    
                    <select {...register("position")} className={styles.select}>
                        
                        <option className={styles.employee} value="Project manager">Project manager</option>
                        <option className={styles.employee} value="Software developer">Software developer</option>
                        <option className={styles.employee} value="Graphic designer">Graphic designer</option>
                        <option  className={styles.employee} value="Financial accountant">Financial accountant</option>
                        <option className={styles.employee} value="DevOps Engineer">DevOps Engineer</option>
                        <option className={styles.employee} value="Junior Product Owner">Junior Product Owner</option>

                    </select>
                    </label> 

                    <div>
                    <button className={styles.button} type="submit">Kreiraj</button>
                    </div>
                </form>

            </div>            
        </div>
    );
};

export default Users;