"use client";
import styles from './createUser.module.css';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';


const Users = (data) => {

    const schema = yup.object().shape({
        firstname: yup.string().required("First name is required!"),
        lastname: yup.string().required("Last name is required!"),
        username: yup.string().required("Username is required!"),
        phone: yup.string().required("Phone is required!"),
        email: yup.string().email().required("Email is required!"),
        Password: yup.string().min(8).required("Password is required"),
        confirmPassword: yup.string().oneOf([yup.ref("password"), null], "Passwords don't match").required(),
        
    });

    const{register, handleSubmit, formState: {errors}} = useForm({
        resolver: yupResolver(schema)
    });

   const onSubmit = () => {
        console.log(data);
    };

    return (
        <div className={styles.container}>

            <div className={styles.form}> 
                <form  onSubmit={handleSubmit(onSubmit)} action="" className={styles.form}>
                    <div className={styles.start}>
                        <span className={styles.title}>Osobni podaci korisnika</span>
                        <span className={styles.desc}> </span> 
                    </div>

                    <label className={styles.firstname}>Ime:
                    <p>{errors.firstname?.message}</p>
                    <input type="text" placeholder="Unesite ime" {...register("firstname")}  autoComplete='off'/></label>
                    
                    <label className={styles.lastname}>Prezime:
                    <p>{errors.lastname?.message}</p>
                    <input type="text" placeholder="Unesite prezime" {...register("lastname")} autoComplete='off'/></label>
                    
                    <label className={styles.username}>Korisničko ime:
                    <p>{errors.username?.message}</p>
                    <input type="text" placeholder="Unesite korisničko ime" {...register("username")} autoComplete='off'/></label>
                    
                    <label className={styles.phone}>Kontakt:
                    <p>{errors.phone?.message}</p>
                    <input type="string" placeholder="Unesite kontakt broj" {...register("phone")} autoComplete='off'/></label> 
                    
                    <label className={styles.email}>Email adresa:
                    <p>{errors.email?.message}</p>
                    <input type="email" placeholder="Unesite email" {...register("email")} autoComplete='off'/></label>

                    <label className={styles.password}>Lozinka:
                    <p>{errors.Password?.message}</p>
                    <input type="password" placeholder="******" {...register("Password")} autoComplete='off'/></label>

                    <label className={styles.confirmPassword}>Potvrda lozinke:
                    <p>{errors.confirmPassword?.message}</p>
                    <input type="password" placeholder="******" {...register("confirmPassword")} autoComplete='off'/></label>
                    
                    <label className={styles.role}>Uloga:
                    
                        <select className={styles.select}>
                            <option  className={styles.admin} value="1">Administrator</option>
                            <option className={styles.employee} value="2">Uposlenik</option>
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
