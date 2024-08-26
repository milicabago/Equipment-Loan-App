"use client"
import styles from '@/app/components/history/page.module.css';
import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import Modal from 'react-modal';

const HistoryPage = () => {
    const [cookies] = useCookies(['accessToken']);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
    const [historyToDelete, setHistoryToDelete] = useState(null);
    const [isDeleteAll, setIsDeleteAll] = useState(false);

    
    const formatDate = (dateTimeString) => {
        const date = new Date(dateTimeString);
        const formattedDate = date.toLocaleDateString('hr-HR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
        const formattedTime = date.toLocaleTimeString('hr-HR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        return `${formattedDate} ${formattedTime}`;
    };
    useEffect(() => {
        Modal.setAppElement('body');
      }, []);
    

    useEffect(() => {
        const token = cookies.accessToken;
        const config = {
            headers: {
                'Authorization': 'Bearer ' + token
            },
        };
        axios.get(process.env.NEXT_PUBLIC_BASE_URL + 'admin/equipmentHistory', config)
            .then(response => {
                console.log('History data:', response.data);
                const returnedItems = response.data.filter(item => item.return_status_request === 'returned');
                setHistory(returnedItems);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching equipment history:', error);
                setLoading(false);
        });
    }, [ cookies.accessToken ]);
    


    const openDeleteModal = (id = null, deleteAll = false) => {
        setHistoryToDelete(id);
        setIsDeleteAll(deleteAll);
        setDeleteModalIsOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalIsOpen(false);
        setHistoryToDelete(null);
        setIsDeleteAll(false);
    };

    const deleteHistoryItem = async () => {
        try {
            const token = cookies.accessToken;
            const config = {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            };
            
            if (isDeleteAll) {
                const idsToDelete = history.map(item => item._id); 
                await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}admin/equipmentHistory/deleteMultiple`, { ids: idsToDelete }, config);
                setHistory([]); 
            } else {
                await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}admin/equipmentHistory/${historyToDelete}`, config);
                setHistory(history.filter(item => item._id !== historyToDelete));
            }

            closeDeleteModal();
        } catch (error) {
            console.error('Error deleting equipment history:', error);
        }
    };


   

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
                        <button className={styles.deleteAll} onClick={() => openDeleteModal(null, true)}>Delete All</button>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>USER</th>
                                <th>EQUIPMENT</th>
                                <th>QUANTITY</th>
                                <th>ASSIGN DATE</th>
                                <th>RETURN DATE</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(item => (
                                <tr key={item._id}>
                                    <td>{item.user_info.first_name} {item.user_info.last_name}</td>
                                    <td>{item.equipment_info ? item.equipment_info.name : 'Unknown'}</td>
                                    <td>{item.unassigned_quantity}</td>
                                    <td>{formatDate(item.assign_date)}</td>
                                    <td>{formatDate(item.unassign_date)}</td>
                                    <td>
                                        <button className={styles.delete} onClick={() => openDeleteModal(item._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div>
                    <h1 className={styles.empty}>The equipment loan history is empty.</h1>
                </div>
            )}

<Modal
                isOpen={deleteModalIsOpen}
                onRequestClose={closeDeleteModal}
                className={styles.modal}
                overlayClassName={styles.overlay}
                contentLabel="Delete Confirmation"
            >
                <h2 className={styles.modalTitle}>{isDeleteAll ? 'Delete All History' : 'Delete equipment history'}</h2>
                <div className={styles.modalContent}>
                    <p className={styles.modalMessage}>
                        {isDeleteAll 
                            ? 'Are you sure you want to delete all items from the history? This action cannot be undone.'
                            : 'Are you sure you want to delete this item?'}
                    </p>
                </div>
                <div className={styles.modalButtons}>
                    <button onClick={deleteHistoryItem}>Confirm</button>
                    <button onClick={closeDeleteModal}>Dismiss</button>
                </div>
            </Modal>
        </div>
    );
};

export default HistoryPage;