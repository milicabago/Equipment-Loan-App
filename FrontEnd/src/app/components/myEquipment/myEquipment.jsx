"use client" 
import styles from './myEquipment.module.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import toast from 'react-hot-toast';
import Modal from 'react-modal';
import { MdSearch } from "react-icons/md";

const MyEquipment = () => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cookies, setCookie, removeCookie] = useCookies(['accessToken']);
    const [equipmentToRead, setEquipmentToRead] = useState(null);
    const [readModalIsOpen, setReadModalIsOpen] = useState(false);
    const [equipmentToAssign, setEquipmentToAssign] = useState(null);
    const [assignModalIsOpen, setAssignModalIsOpen] = useState(false);
    const [assignQuantity, setAssignQuantity] = useState(1);
    const [currentQuantity] = useState(); 
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredEquipment, setFilteredEquipment] = useState([]);

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

      
    const readEquipment = async (equipmentId) => {
        try{
            const token = cookies.accessToken;
            const config = {
            headers: {
                'Authorization': 'Bearer ' + token
            }
            };
            const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + `user/equipment${equipmentId}` , config);
            setEquipmentToRead(response.data);
            setReadModalIsOpen(true);
        } catch (error) {
            console.error("Error:", error);
        }
    };
            

    const assignEquipment = async (equipmentId) => {
        try {
            let token = document.cookie
            .split('; ')
            .find(row => row.startsWith('accessToken'))
            .split('=')[1];
            const equipmentToAssign = equipment.find(equipment => equipment._id === equipmentId);
            if (!Number.isInteger(assignQuantity) || assignQuantity <= 0 || assignQuantity > currentQuantity) {
                return;
            }
            await axios.post(process.env.NEXT_PUBLIC_BASE_URL + 'user/equipment/request', 
                    { input_quantity: assignQuantity,
                    equipment_id: equipmentId
                },{
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setEquipment(prevEquipment => prevEquipment.map(equipment => {
            if (equipment._id === equipmentId) {    
                return { ...equipment, input_quantity: assignQuantity };
            }
            return equipment;
            }));
            closeAssignModal();
            toast.success('Request sent successfully!', { duration: 3000 } );
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const openReadModal = (equipment) => {
    const equipmentWithBooleanCondition = {
        ...equipment,
        condition: equipment.condition === "true" ? true : false
    };
    setEquipmentToRead(equipment);
    setReadModalIsOpen(true);
    };
    const closeReadModal = () => {
    setEquipmentToRead(null);
    setReadModalIsOpen(false);
    };

    const openAssignModal = (equipment) => {
    setEquipmentToAssign(equipment);
    setAssignModalIsOpen(true);
    };
    const closeAssignModal = () => {
    setEquipmentToAssign(null);
    setAssignModalIsOpen(false);
    };


    useEffect(() => {
        const filtered = equipment.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.full_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredEquipment(filtered);
    }, [searchTerm, equipment]);

    return (
        <div className={styles.container}>
        {loading ? (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
            </div>
        ) : (
            <div>
            <div className={styles.title}>
                <h1>Equipment</h1>
            </div>
            <div>
                <div className={styles.search}>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.inputs}
                    />
                    <MdSearch className={styles.searchIcon}/>
                </div>
            </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>NAME</th> 
                            <th>MODEL</th>
                            <th>QUANTITY</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEquipment.map(item => (
                            <tr key={item._id}>
                                <td className={styles.name}>{item.name}</td>
                                <td className={styles.model}>{item.full_name}</td>
                                <td className={styles.quantity}>{item.quantity}</td>
                                <td className={styles.button}>
                                <button className={styles.assign} onClick={() => openAssignModal(item)}>Assign</button>
                                <button className={styles.seeMore} onClick={() => openReadModal(item)}>See More</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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
                    <p><span className={styles.label}>Serial Number: </span><span className={styles.value}>{equipmentToRead.serial_number}</span></p>
                    <p><span className={styles.label}>Condition: </span><span className={styles.value}>{equipmentToRead.condition === true ? "Functional" : "Non-functional"}</span></p>
                    <p><span className={styles.label}>Quantity: </span><span className={styles.value}>{equipmentToRead.quantity}</span></p>
                    <p><span className={styles.label}>Description: </span><span className={styles.value}>{equipmentToRead.description ? (equipmentToRead.description) : (<span className={styles.italic}>none</span>) }</span></p>
                </div>
            )}
            <div className={styles.modalButtons}>
                <button onClick={closeReadModal}>Close</button>
            </div>
        </Modal>
        <Modal
            isOpen={assignModalIsOpen}
            onRequestClose={closeAssignModal}
            className={styles.modal}
            overlayClassName={styles.overlay}
            contentLabel="Assigment Modal" 
            >
            <h2 className={styles.modalTitle}>Assigment</h2>
            {equipmentToAssign && (
                <div>
                    <p className={styles.question}>Current quantity: {equipmentToAssign.quantity}</p>
                    <label className={styles.question} htmlFor="assignQuantity">Quantity to assign:</label>
                    <input className={styles.input}
                        type="number"
                        id="assignQuantity"
                        min="1"
                        max={equipmentToAssign.quantity}
                        value={assignQuantity}
                        onChange={(e) => setAssignQuantity(parseInt(e.target.value))}
                    />
                    <p className={styles.question}> Are you sure you want to assign this equipment?</p>
                    <div className={styles.modalButtons}>
                        <button onClick={() => assignEquipment(equipmentToAssign._id)}>Assign</button>
                        <button onClick={closeAssignModal}>Close</button>
                    </div>
                </div>
            )}
        </Modal>
        </div>
    )
}
export default MyEquipment;