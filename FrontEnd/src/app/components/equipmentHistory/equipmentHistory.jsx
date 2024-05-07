"use client"
import styles from './equipmentHistory.module.css';
import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const EquipmentHistory = () => {
    const [cookies] = useCookies(['accessToken']);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
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
        axios.get(process.env.NEXT_PUBLIC_BASE_URL + 'user/equipmentHistory', config)
            .then(response => {
                console.log('History data:', response.data);
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
            ) : history.length > 0 ? (
                <div>
                <div className={styles.title}>
                    <h1>Equipment History</h1>
                </div>
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
                                        <td>{item.user_id}</td>
                                        <td>{item.equipment_info ? item.equipment_info.name : 'Unknown'}</td>
                                        <td>{item.equipment_id}</td>
                                        <td>{item.unassigned_quantity}</td>
                                        <td>{formatDate(item.createdAt)}</td>
                                        <td>{formatDate(item.assign_date)}</td>
                                        <td>{item.return_status_request}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                ):(
                    <div>
                        <h1 className={styles.empty}>The equipment loan history is empty.</h1>
                    </div>
            )}
        </div>

    );
    
};
export default EquipmentHistory;