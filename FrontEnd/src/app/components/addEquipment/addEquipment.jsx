"use client";
import styles from './addEquipment.module.css';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';


const AddEquipment = (data) => {

    const schema = yup.object().shape({
        name: yup.string().required("Name is required"),
        full_name: yup.string().required("Full name is required"),
        serial_number: yup.string().required("Serial number is required"),
        quantity: yup.number().required("Quantity is required"),
        condition: yup.string().required("Condition is required"),
        description: yup.string()
    });

    const{ register, handleSubmit, formState: {errors}, reset} = useForm({
        resolver: yupResolver(schema)
    });

    const [cookies, setCookie, removeCookie] = useCookies(['accessToken']);

    const addEquipment = async (equipmentData) => {
        try {
            const token = cookies.accessToken;
            if (token) {
                const decodedToken = jwtDecode(token);
                const config = {
                    headers: {
                        'Authorization': 'Bearer ' + cookies.accessToken
                    }
                };
                const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL + 'admin/addEquipment', equipmentData, config);
                console.log("New equipment added:", response.data);
                toast.success('New equipment added successfully!');
                reset(); 
            }
        } catch (error) {
            console.error(error);
            toast.error('Error adding new equipment!');
        }
    };


    const onSubmit = (formData) => {
        addEquipment(formData);
        console.log(formData);
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
                    <input type="number" placeholder="Unesite količinu" {...register("quantity")} autoComplete='off' /></label>
                    


                    
                    <label className={styles.condition}>Stanje opreme:
                        <p>{errors.condition?.message}</p>
                        <select className={styles.select} {...register("condition")}>
                            <option  className={styles.true} value="1">Ispravno</option>
                            <option className={styles.false} value="2">Neispravno</option>
                        </select>
                    </label>

                    <label className={styles.detail}>Opis:
                        <textarea className={styles.description} placeholder="Dodajte opis.." {...register("description")} name=""></textarea>
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