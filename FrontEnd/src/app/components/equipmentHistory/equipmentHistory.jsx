"use client"
import styles from './equipmentHistory.module.css';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import Modal from 'react-modal';

const EquipmentHistory = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['accessToken']);
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userToEdit, setUserToEdit] = useState(null)
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);

    const formatDate = (dateTimeString) => {
        const date = new Date(dateTimeString);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString();
        return `${formattedDate} ${formattedTime}`;
    };

   


    useEffect(() => {
        const token = cookies.accessToken;
        const config = {
            headers: {
                'Authorization': 'Bearer ' + token
            },
        };
        axios.get(process.env.NEXT_PUBLIC_BASE_URL + 'admin/equipmentHistory', config)
            .then(response => {
                setHistory(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching equipment history:', error);
                setLoading(false);
            });
    }, [ cookies.accessToken ]);

    return (
        <div className={styles.container}>
            
            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                </div>
            ) : (
                <div>
                <div className={styles.title}>
                    <h1>Moja razdužena oprema</h1>
                </div>
                {history.length === 0 ? (
                        <p>No equipment history available</p>
                    ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>USER</th>
                            <th>EQUIPMENT</th>
                            <th>QUANTITY</th>
                            <th>ASSIGN DATE</th>
                            <th>RETURN DATE</th>
                            <th>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                      {history.map(item => (
                        
                                <tr key={item._id}>
                                    <td>{item.user_info ? `${item.user_info.first_name} ${item.user_info.last_name}` : 'Unknown'}</td>
                                    <td>{item.equipment_info ? item.equipment_info.name : 'Unknown'}</td>
                                    <td>{item.quantity}</td>
                                    <td>{formatDate(item.assign_date)}</td>
                                    <td>{item.request_status}</td>
                                </tr>
                            ))}
                        
                    </tbody>
                
                </table>
            )}
                </div>
            )}
        </div>
      
    );
    
};
export default EquipmentHistory;