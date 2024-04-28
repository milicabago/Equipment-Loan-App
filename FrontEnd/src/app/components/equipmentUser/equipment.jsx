"use client" 
import styles from './equipment.module.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useRouter } from "next/navigation";
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import Modal from 'react-modal';


const Equipment = () => {
    const [equipment, setEquipment] = useState([]);
    const [isUser, setIsUser] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [cookies, setCookie, removeCookie] = useCookies(['accessToken']);
    const router = useRouter();
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
    const [equipmentToDelete, setEquipmentToDelete] = useState(null);
    const [equipmentToEdit, setEquipmentToEdit] = useState(null);
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);

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


    const deleteEquipment = (itemId) => {
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
            axios.delete(process.env.NEXT_PUBLIC_BASE_URL + `user/equipment/${itemId}`, config)
                .then((response) => {
                    setEquipment(equipment.filter(item => item._id !== itemId));
                    setDeleteModalIsOpen(false);
                    toast.success("Equipment deleted successfully!");
                })
                .catch((error) => {
                    console.error("Error:", error);
                    toast.error("Error deleting equipment!");
                });
            }
        }
    }

    const updateEquipment = async (itemId) => {
        try{
          const token = cookies.accessToken;
          const decodedToken = jwtDecode(token);
          const config = {
            headers: {
              'Authorization': 'Bearer ' + cookies.accessToken
            }
          };
          const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + `user/equipment/${itemId}` , config);
          setEquipmentToEdit(response.data);
          setEditModalIsOpen(true);
        } catch (error) {
          console.error("Error:", error);
          toast.error('Error fetching item data!');
        }
    
      };


    
    const openDeleteModal = async (itemId) => {
        try{
          const token = cookies.accessToken;
          const decodedToken = jwtDecode(token);
          const config = {
            headers: {
              'Authorization': 'Bearer ' + cookies.accessToken
            }
          };
          const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + `user/equipment/${itemId}` , config);
          setEquipmentToDelete(response.data);
          setDeleteModalIsOpen(true);
          
        } catch (error) {
          console.error("Error:", error);
          toast.error('Error fetching item data!');
        }
      };
    
      const closeDeleteModal = () => {
        setDeleteModalIsOpen(false);
        setEquipmentToDelete(null);
      };


      const openEditModal = (item) => {
        setEquipmentToEdit(item);
        setEditModalIsOpen(true);
      };
    
      const closeEditModal = () => {
        setEquipmentToEdit(null);
        setEditModalIsOpen(false);
      };



    return (
        <div className={styles.container}>
            <div className={styles.title}>
                 <h1>Oprema</h1>
             </div>


             
             <div>
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
                            <td>
                                <button className={styles.edit} onClick={() => openEditModal(item)}>Edit</button>
                                <button className={styles.delete} onClick={() => openDeleteModal(item._id)}>Delete</button>
                                
                            </td>                            
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={deleteModalIsOpen}
                onRequestClose={closeDeleteModal}
                className={styles.modal}
                overlayClassName={styles.overlay}
                contentLabel="Delete Equipment Confirmation Modal"
                 >
                <h2 className={styles.modalTitle}>Delete Equipment</h2>
                {equipmentToDelete && (
                <div className={styles.modalContent}>
                    <p className={styles.modalMessage}>
                    Are you sure you want to delete <strong>{equipmentToDelete.first_name} {equipmentToDelete.last_name}</strong>?
                    </p>
                </div>
                )}
                <div className={styles.modalButtons}>
                <button onClick={closeDeleteModal}>Cancel</button>
                {equipmentToDelete && (
                    <button onClick={() => deleteEquipment(equipmentToDelete._id)}>Delete</button>
                )}
                </div>
            </Modal>
            <Modal
            isOpen={editModalIsOpen}
            onRequestClose={closeEditModal}
            className={styles.modal}
            overlayClassName={styles.overlay}
            contentLabel="Edit Equipment Modal"
            >
            <h2 className={styles.modalTitle}>Edit Equipment</h2>
            {equipmentToEdit && (
                <div className={styles.modalContent}>
                
                <input
                    type="text"
                    value={equipmentToEdit.name}
                    onChange={(e) => setEquipmentToEdit({...setEquipmentToEdit, name: e.target.value})}
                />
                <input
                    type="text"
                    value={equipmentToEdit.full_name}
                    onChange={(e) => setEquipmentToEdit({...setEquipmentToEdit, full_name: e.target.value})}
                />
                <input
                    type="text"
                    value={equipmentToEdit.serial_number}
                    onChange={(e) => setEquipmentToEdit({...setEquipmentToEdit, serial_number: e.target.value})}
                />

                
                </div>
            )}
            <div className={styles.modalButtons}>
                <button onClick={closeEditModal}>Cancel</button>
                <button onClick={updateEquipment}>Save</button>
            </div>
            </Modal>

            
        </div>
    )
}

export default Equipment;