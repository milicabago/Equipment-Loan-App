"use client";
import styles from './createUser.module.css';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect} from 'react';
import toast from 'react-hot-toast';
import { reset } from 'react-hook-form'; 
    
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

    const [cookies, setCookie, removeCookie] = useCookies(['accessToken']);
    const [formData, setFormData] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const [loggedInUser, setLoggedInUser] = useState(null);
    const{register, handleSubmit, formState: {errors}, reset} = useForm({
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        const token = cookies.accessToken;
    
        if (token) {
          const decodedToken = jwtDecode(token);
          setLoggedInUser(decodedToken);
          console.log("Logged in user:", decodedToken)
          console.log("Logged in admin:", decodedToken.user.role)
          let config = {
            headers: {
              'Authorization': 'Bearer ' + cookies.accessToken
            }
          }
          if (decodedToken.user.role.includes('admin') ) {
            console.log("uspjeh", decodedToken.user.role)
            setIsAdmin(true);
            

          } else (console.log("greskaa:"))
        }
      }, [cookies.accessToken]);


    const onSubmit = async (data) => {
        
        try{
            let config = {
                headers: {
                  'Authorization': 'Bearer ' + cookies.accessToken
                }
              }
            const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL + 'admin/createUser', data, config);
            console.log('Novi korisnik je uspješno kreiran:', response.data);
            reset();            
        } catch (error) {
            console.log('Greška prilikom kreiranja korisnika:', error);
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
                    <input type="password" placeholder="••••••••" {...register("password")} autoComplete='off'/></label>

                    <label className={styles.confirmPassword}>Potvrda lozinke:
                    <p>{errors.confirm_password?.message}</p>
                    <input type="password" placeholder="••••••••" {...register("confirm_password")} autoComplete='off'/></label>
                    
                    <label className={styles.role}>Uloga:
                    
                    <select {...register("role")} className={styles.select} defaultValue="user">
                            <option  className={styles.admin} value="admin">Administrator</option>
                            <option className={styles.user} value="user">Uposlenik</option>
                        </select>
                    </label> 

                    <label className={styles.position}>Pozicija:
                    
                    <select {...register("position")} className={styles.select}>
                        
                        <option className={styles.employee} value="1">Project manager</option>
                        <option className={styles.employee} value="2">Software developer</option>
                        <option className={styles.employee} value="3">Graphic designer</option>
                        <option  className={styles.employee} value="4">Financial accountant</option>
                        <option className={styles.employee} value="5">DevOps Engineer</option>
                        <option className={styles.employee} value="6">Junior Product Owner</option>

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