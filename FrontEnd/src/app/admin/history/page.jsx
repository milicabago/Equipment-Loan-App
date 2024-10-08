"use client"
import styles from '@/app/components/history/page.module.css';
import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import { MdSearch } from 'react-icons/md';

const HistoryPage = () => {
    const [cookies] = useCookies(['accessToken']);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
    const [historyToDelete, setHistoryToDelete] = useState(null);
    const [isDeleteAll, setIsDeleteAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const formatDate = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return `${date.toLocaleDateString('hr-HR')} ${date.toLocaleTimeString('hr-HR')}`;
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
        axios.get(process.env.NEXT_PUBLIC_BASE_URL + 'admin/history', config)
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
    }, [cookies.accessToken]);

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
                await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}admin/history/deleteAllHistory`, config);
                setHistory([]);
                toast.success('All history items have\nbeen successfully deleted!', { duration: 3000 });
            } else {
                await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}admin/history/${historyToDelete}`, config);
                setHistory(history.filter(item => item._id !== historyToDelete));
                toast.success('Item from history\nsuccessfully deleted!', { duration: 3000 });
            }

            closeDeleteModal();
        } catch (error) {
            console.error('Error deleting equipment history:', error);
            toast.error('An error occurred while deleting history!', { duration: 3000 });
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
                    <div className={styles.search}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.inputs}
                        />
                        <MdSearch className={styles.searchIcon} />

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
                        {history.filter(item => 
                                (item.user_info && `${item.user_info.first_name} ${item.user_info.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                (item.equipment_info && item.equipment_info.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            ).map(item => (

                           
                                <tr key={item._id} className={item._id === historyToDelete ? styles.highlightedRow : ''}>
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