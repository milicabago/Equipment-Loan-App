"use client";
import styles from './addEquipment.module.css';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';


const AddEquipment = (data) => {

    const schema = yup.object().shape({
        equipment: yup.string().required("Equipment is required"),
        name: yup.string().required("Name is required"),
        number: yup.string().required("Number is required"),
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
                    <p>{errors.equipment?.message}</p>
                    <input type="text" placeholder="Unesite naziv opreme" {...register ("equipment")} autoComplete='off'/></label>

                    <label className={styles.name}>Naziv modela pripadajuće opreme:
                    <p>{errors.name?.message}</p>
                    <input type="text" placeholder="Unesite naziv modela" {...register("name")} autoComplete='off' /></label>

                    <label className={styles.number}>Serijski broj:
                    <p>{errors.number?.message}</p>
                    <input type="text" placeholder="Unesite serijski broj" {...register("phone")} autoComplete='off' /></label>


                    
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

export default AddEquipment;