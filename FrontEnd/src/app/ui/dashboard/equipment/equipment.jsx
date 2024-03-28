"use client";
import styles from './equipment.module.css';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';


const Equipment = (data) => {

    const schema = yup.object().shape({
        equipment: yup.string().required(),
        name: yup.string().required(),
        phone: yup.string().required(),
    });

    const{ register, handleSubmit, formState: {errors}} = useForm({
        resolver: yupResolver(schema)
    });

    const onSubmit = () => {
        console.log(data);
    };

    return(
        <div className={styles.container}>

            <div className={styles.form}> 
                <form onSubmit={handleSubmit(onSubmit)} action="" className={styles.form}>
                    <div className={styles.start}>
                        <span className={styles.title}>Podaci o opremi</span>
                        <span className={styles.desc}> </span> 
                    </div>

                    <label className={styles.equipment}>Oprema:
                    <input type="text" placeholder="Unesite naziv opreme" {...register ("equipment")} /></label>
                    <label className={styles.name}>Naziv modela pripadajuće opreme:
                    <input type="text" placeholder="Unesite naziv modela" {...register("name")} /></label>
                    <label className={styles.phone}>Serijski broj:
                    <input type="text" placeholder="Unesite serijski broj" {...register("phone")} /></label>


                    
                    <label className={styles.status}>Stanje opreme:
                    
                        <select className={styles.select}>
                            <option  className={styles.true} value="1">Ispravno</option>
                            <option className={styles.false} value="2">Neispravno</option>
                        </select>
                    </label>

                    <label className={styles.detail}>Opis:
                        <textarea className={styles.details} placeholder="Dodajte opis.." name=""></textarea>
                    </label>

                    <div >
                    <button className={styles.button} type="submit">Dodaj</button>
                    </div>
                </form>

            </div>            
        </div>
    )
}

export default Equipment;