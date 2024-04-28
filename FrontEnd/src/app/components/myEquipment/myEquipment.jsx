"use client" 
import styles from './myEquipment.module.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useRouter } from "next/navigation";
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import Modal from 'react-modal';


const MyEquipment = () => {
    const [equipment, setEquipment] = useState([]);
    const [isUser, setIsUser] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [cookies, setCookie, removeCookie] = useCookies(['accessToken']);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
  
    const [equipmentToRead, setEquipmentToRead] = useState(null);
    const [readModalIsOpen, setReadModalIsOpen] = useState(false);


    useEffect(() => {
        const token = cookies.accessToken;
        if (token) {
            const decodedToken = jwtDecode(token);
            setLoggedInUser(decodedToken);
            let config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            if (decodedToken.user.role.includes('user')) {
                setIsUser(true);
                axios.get(process.env.NEXT_PUBLIC_BASE_URL + "user/equipment", config)
                    .then((response) => {
                        setEquipment(response.data);
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });
                }else {
                    console.log("greskaa:")
                }
            }
        }, [cookies.accessToken]);

        const assignEquipment = async (equipmentId) => {    
            try {
                const token = cookies.accessToken;
                const config = {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                };
                const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL + `user/equipment/request`, {equipmentId}, config);
                console.log("Equipment assigned successfully:" ,response.data);+
                toast.success('Equipment assigned successfully!');
            } catch (error) {
                console.error("Error:", error);
                toast.error('Error assigning equipment!');
            }
        };


        const readEquipment = async (equipmentId) => {
            try{
                const token = cookies.accessToken;
                const decodedToken = jwtDecode(token);
                const config = {
                headers: {
                    'Authorization': 'Bearer ' + cookies.accessToken
                }
                };
                const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + `user/equipment${equipmentId}` , config);
                setEquipmentToRead(response.data);
                setReadModalIsOpen(true);
            } catch (error) {
                console.error("Error:", error);
                toast.error('Error fetching item data!');
            }
        
            };
            


   

  


     

      const openReadModal = (equipment) => {
        setEquipmentToRead(equipment);
        setReadModalIsOpen(true);
      };
    
      const closeReadModal = () => {
        setEquipmentToRead(null);
        setReadModalIsOpen(false);
      };


    return (
        <div className={styles.container}>
            

             

            
             <div>
             <div className={styles.title}>
                 <h1>Oprema</h1>
             </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>NAME</th> 
                            <th>MODEL</th>
                            <th>SERIAL NUMBER</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {equipment.map(item => (
                            <tr key={item._id}>
                                <td className={styles.name}>{item.name}</td>
                                <td className={styles.model}>{item.full_name}</td>
                                <td className={styles.serial_number}>{item.serial_number}</td>
                                <td className={styles.button}>
                                    {isUser && (
                                        <button className={styles.assignButton} onClick={() => assignEquipment(item._id)}>Assign</button>
                                    )}
                                    <button className={styles.seeMore} onClick={() => openReadModal(item)}>See More</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isUser && equipmentToRead && (
            <button className={styles.assignButton} onClick={() => assignEquipment(equipmentToRead._id)}>Zaduzi opremu</button>
        )}

            

<Modal
            isOpen={readModalIsOpen}
            onRequestClose={closeReadModal}
            className={styles.modal}
            overlayClassName={styles.overlay}
            contentLabel="Read Equipment Modal"
            >
            <h2 className={styles.modalTitle}>Equipment Details</h2>
            {equipmentToRead && (
                <div className={styles.modalContent}>
                    <p><span className={styles.label}>Name: </span><span className={styles.value}>{equipmentToRead.name}</span></p>
                    <p><span className={styles.label}>Model: </span><span className={styles.value}>{equipmentToRead.full_name}</span></p>
                    <p><span className={styles.label}>Condition: </span><span className={styles.value}>{equipmentToRead.condition}</span></p>
                    <p><span className={styles.label}>Quantity: </span><span className={styles.value}>{equipmentToRead.quantity}</span></p>
                    <p><span className={styles.label}>Description: </span><span className={styles.value}>{equipmentToRead.description}</span></p>
                </div>
            
            )}
            <div className={styles.modalButtons}>
                <button onClick={closeReadModal}>Close</button>
            </div>
            </Modal>
        </div>
    )
}

export default MyEquipment;