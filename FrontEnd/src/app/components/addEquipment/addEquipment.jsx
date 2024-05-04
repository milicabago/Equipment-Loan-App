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
                        <span className={styles.title}>Equipment Data</span>
                        <span className={styles.desc}> </span> 
                    </div>

                    <label className={styles.name}>Equipment:
                    <p>{errors.name?.message}</p>
                    <input type="text" placeholder="Enter equipment name" {...register ("name")} autoComplete='off'/></label>

                    <label className={styles.full_name}>Equipment Model Full Name:
                    <p>{errors.full_name?.message}</p>
                    <input type="text" placeholder="Enter model name" {...register("full_name")} autoComplete='off' /></label>

                    <label className={styles.serial_number}>Serial Number:
                    <p>{errors.serial_number?.message}</p>
                    <input type="text" placeholder="Enter serial number" {...register("serial_number")} autoComplete='off' /></label>

                    <label className={styles.quantity}>Quantity:
                    <p>{errors.quantity?.message}</p>
                    <input type="number" placeholder="Enter quantity" {...register("quantity")} autoComplete='off' min="1" /></label>
                    


                    
                    <label className={styles.condition}>
                    Equipment Condition:
                        <p>{errors.condition?.message}</p>
                        <select className={styles.select} {...register("condition")}>
                            <option value="true">Functional</option>
                            <option value="false">Non-functional</option>
                        </select>
                    </label>


                    <label className={styles.detail}>Description:
                    <textarea className={styles.description} placeholder="Add description.." {...register("description")} value={data.description}></textarea>
                    </label>

                    <div >
                    <button className={styles.button} type="submit">Add Equipment</button>
                    </div>
                </form>

            </div>            
        </div>
    )
}

export default AddEquipment;