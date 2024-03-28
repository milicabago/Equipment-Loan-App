"use client";
import styles from './users.module.css';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';


const Users = (data) => {

    const schema = yup.object().shape({
        firstname: yup.string().required("First name is required!"),
        lastname: yup.string().required("Last name is required!"),
        username: yup.string().required("Username is required"),
        phone: yup.string().required("Phone is required"),
        email: yup.string().email().required("Email is required"),
        password: yup.string().min(8).required("Password is required"),
        confirmPassword: yup.string().oneOf([yup.ref("password"), null] ,"Passwords don't match").required("Password is required"),
        
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
                    <input type="text" placeholder="Unesite ime" {...register("firstname")} /></label>
                    
                    <label className={styles.lastname}>Prezime:
                        <p>{errors.lastname?.message}</p>
                    <input type="text" placeholder="Unesite prezime" {...register("lastname")}/></label>
                    
                    <label className={styles.username}>Korisničko ime:
                    <p>{errors.username?.message}</p>
                    <input type="text" placeholder="Unesite korisničko ime" {...register("username")} /></label>
                    <label className={styles.phone}>Kontakt:
                    <input type="string" placeholder="Unesite kontakt broj" {...register("phone")}/></label> 
                    <label className={styles.email}>Email adresa:
                    <input type="email" placeholder="Unesite email" {...register("email")}/></label>
                    <label className={styles.password}>Lozinka:
                    <input type="password" placeholder="******" {...register("password")}/></label>
                    <label className={styles.confirmPassword}>Potvrda lozinke:
                    <input type="password" placeholder="******" {...register("confirmPassword")}/></label>
                    
                   {/* } <label className={styles.role}>Uloga:
                    
                        <select className={styles.select}>
                            <option  className={styles.admin} value="1">Administrator</option>
                            <option className={styles.employee} value="2">Uposlenik</option>
                        </select>
                    </label> */}
                    <div>
                    <button className={styles.button} type="submit">Kreiraj</button>
                    </div>
                </form>

            </div>            
        </div>
    );
};

export default Users;
