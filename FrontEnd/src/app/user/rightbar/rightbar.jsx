"use client"
import styles from './rightbar.module.css'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import toast from 'react-hot-toast';
import Modal from 'react-modal';

const Rightbar = () => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cookies, setCookie, removeCookie] = useCookies(['accessToken']);

    const equipmentNames = equipment.map(item => item.name);
    const equipmentQuantities = equipment.map(item => item.quantity);

    useEffect(() => {
        console.log("Access Token Cookie:", cookies.accessToken);
        const token = cookies.accessToken;
        let config = {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        }
        axios.get(process.env.NEXT_PUBLIC_BASE_URL + "user/equipment", config)
          .then((response) => {
            setEquipment(response.data);
            console.log("Equipment:", response.data);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error:", error);
            setLoading(false);
        });


    }, [cookies.accessToken]);

    return(
        <div className={styles.container}>

            
        </div>
    )
}

export default Rightbar;