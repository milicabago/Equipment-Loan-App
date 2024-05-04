"use client";
import styles from './addEquipment.module.css';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect} from 'react';
import toast from 'react-hot-toast';

     const schema = yup.object().shape({
        name: yup.string().required('Name is required!').matches(/^(\S+\s)*\S+$/, 'Too many spaces entered!'),
            full_name: yup.string().required('Full name is required!').matches(/^(\S+\s)*\S+$/, 'Too many spaces entered!'),
            serial_number: yup.string().required('Serial number is required!').matches(/^(\S+\s)*\S+$/, 'Too many spaces entered!'),
            quantity: yup.number().required().typeError('Quantity must be a number!').integer("Quantity must be an integer!").min(1, "Quantity must be at least '1'!"),
            condition: yup.boolean().required(),
            description: yup.string().optional(),
    
    });

const AddEquipment = (data) => {
    const [createdEquipment, setCreatedEquipment] = useState(null);
    const [cookies] = useCookies(['accessToken']);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        if (createdEquipment) {
            const timer = setTimeout(() => {
                window.location.reload()
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [createdEquipment]);

    const onSubmit = async (data) => {
        try {
            let token = document.cookie
                .split('; ')
                .find(row => row.startsWith('accessToken'))
                .split('=')[1];
                const condition = data.condition === "true";
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}admin/addEquipment`, {
                name: data.name,
                full_name: data.full_name,
                serial_number: data.serial_number,
                quantity: data.quantity,
                condition: condition,
                description: data.description
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log(response.data);
            toast.success('Equipment added successfully!');
            setCreatedEquipment(response.data);
        } catch (error) {
            if (error.response && error.response.data) {
                toast.error(error.response.data.message, { duration: 3000 });
            } else {
                toast.error('Failed to add equipment!', { duration: 3000 });
            }
        }
    };


    return(
        <div className={styles.container}>

            <div className={styles.form}> 
                <form onSubmit={handleSubmit(onSubmit)} action="" className={styles.form}>
                    <div className={styles.start}>
                        <span className={styles.title}>Podaci o opremi</span>
                        <span className={styles.desc}> </span> 
                    </div>

                    <label className={styles.name}>Oprema:
                    <p>{errors.name?.message}</p>
                    <input type="text" placeholder="Unesite naziv opreme" {...register ("name")} autoComplete='off'/></label>

                    <label className={styles.full_name}>Naziv modela pripadajuće opreme:
                    <p>{errors.full_name?.message}</p>
                    <input type="text" placeholder="Unesite naziv modela" {...register("full_name")} autoComplete='off' /></label>

                    <label className={styles.serial_number}>Serijski broj:
                    <p>{errors.serial_number?.message}</p>
                    <input type="text" placeholder="Unesite serijski broj" {...register("serial_number")} autoComplete='off' /></label>

                    <label className={styles.quantity}>Količina:
                    <p>{errors.quantity?.message}</p>
                    <input type="number" placeholder="Unesite količinu" {...register("quantity")} autoComplete='off' min="1" /></label>
                    


                    
                    <label className={styles.condition}>
                        Stanje opreme:
                        <p>{errors.condition?.message}</p>
                        <select className={styles.select} {...register("condition")}>
                            <option value="true">Ispravno</option>
                            <option value="false">Neispravno</option>
                        </select>
                    </label>


                    <label className={styles.detail}>Opis:
                    <textarea className={styles.description} placeholder="Dodajte opis.." {...register("description")} value={data.description}></textarea>
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