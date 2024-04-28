"use client"
import styles from './dashboard.module.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import Modal from 'react-modal';

const Dashboard = () => {
    const [requests, setRequests] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [cookies, setCookie, removeCookie] = useCookies(['accessToken']);
    const [loading, setLoading] = useState(true);
    const [requestsToDelete, setRequestsToDelete] = useState(null);
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
    const [requestToRead, setRequestToRead] = useState(null);
    const [readModalIsOpen, setReadModalIsOpen] = useState(false);
    const formatDate = (dateTimeString) => {
        const date = new Date(dateTimeString);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString();
        return `${formattedDate} ${formattedTime}`;
    };
    
    useEffect(() => {
        const token = cookies.accessToken;
        if (token) {
            const decodedToken = jwtDecode(token);
            let config = {
                headers: {
                    'Authorization': 'Bearer ' + cookies.accessToken
                }
            };
            if (decodedToken.user.role.includes('admin') ) {
                console.log("uspjeh", decodedToken.user.role)
                setIsAdmin(true);
                axios.get(process.env.NEXT_PUBLIC_BASE_URL + "admin", config)
                .then((response) => {
                    setRequests(response.data);
                  console.log("Requests:", response.data);
                  setLoading(false);
                })
                .catch((error) => {
                  console.error("Error:", error);
                  setLoading(false);
                });
            }
        }
    }, [cookies.accessToken]);

    const readRequests = async (itemId) => {
    try{
        const token = cookies.accessToken;
        const decodedToken = jwtDecode(token);  
        let config = {
            headers: {
                'Authorization': 'Bearer ' + cookies.accessToken
            }
        };
        const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + `admin/${itemId}` , config);
        setRequestToRead(response.data);
        setReadModalIsOpen(true);
    } catch (error) {
        console.error("Error:", error);
        toast.error('Error fetching item data!');
    }

    };
    const deleteRequests = (itemId) => {
    const token = cookies.accessToken;

    if (token) {
        const decodedToken = jwtDecode(token);
        let config = {
        headers: {
            'Authorization': 'Bearer ' + cookies.accessToken
        }
        }
        if (decodedToken.user.role.includes('admin')) {
        axios.delete(process.env.NEXT_PUBLIC_BASE_URL + `admin/${itemId}`, config)
            .then((response) => {
            setRequests(requests.filter(item => item._id !== itemId));
            console.log("Request successfully deleted:", itemId); 
            toast.success(`Request ${itemId} has been deleted successfully!`);
            setDeleteModalIsOpen(false);
            })
            .catch((error) => {
            console.error("Error:", error);
            toast.error('Error deleting Request!');
            });
        }
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
          const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + `admin/${itemId}`, config);
          setRequestsToDelete(response.data);
          setDeleteModalIsOpen(true);
          
        } catch (error) {
          console.error("Error:", error);
          toast.error('Error fetching item data!');
        }
    };
    const closeDeleteModal = () => {
        setDeleteModalIsOpen(false);
        setRequestsToDelete(null);
    };    
    const openReadModal = (item) => {
        setRequestToRead(item);
        setReadModalIsOpen(true);
    };
    const closeReadModal = () => {
        setRequestToRead(null);
        setReadModalIsOpen(false);
    };

    return (
        <div className={styles.container}>
        {loading ? (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
            </div>
        ) : (
            <div>
                <div className={styles.title}>
                  <h1>Zadužena oprema</h1>
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>USER</th>
                            <th>EQUIPMENT</th>
                            <th>QUANTITY</th>
                            <th>DATE</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                      {requests.map(item => (
                                <tr key={item._id}>
                                    <td className={styles.user_info}>{item.user_info ? `${item.user_info.first_name} ${item.user_info.last_name}` : 'Unknown'}</td>
                                    <td className={styles.equipment_info}>{item.equipment_info ? item.equipment_info.name : 'Unkrnown'}</td>
                                    <td className={styles.quantity}>{item.quantity}</td>
                                    <td className={styles.assign_date}>{formatDate(item.assign_date)}</td>
                                    <td className={`${styles.status} ${item.request_status === 'active' ? styles.active : ''}`}>
                                        {item.request_status === 'active' ? 'Active' : item.request_status}
                                    </td>
                                    <td>
                                        <button className={styles.delete} onClick={() => openDeleteModal(item._id)}>Return</button>
                                        <button className={styles.seeMore} onClick={() => openReadModal(item)}>See More</button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        )}
        <Modal
            isOpen={deleteModalIsOpen}
            onRequestClose={closeDeleteModal}
            className={styles.modal}
            overlayClassName={styles.overlay}
            contentLabel="Delete  Request Confirmation Modal">
            <h2 className={styles.modalTitle}>Delete  Request</h2>
            {requestsToDelete && (
            <div className={styles.modalContent}>
                <p className={styles.modalMessage}>
                Are you sure you want to delete <strong>{requestsToDelete.user_info.first_name} {requestsToDelete.user_info.last_name} {requestsToDelete.equipment_info.name}</strong>?
                </p>
            </div>
            )}
            <div className={styles.modalButtons}>
            <button onClick={closeDeleteModal}>Cancel</button>
            {requestsToDelete && (
                <button onClick={() => deleteRequests(requestsToDelete._id)}>Delete</button>
            )}
            </div>
        </Modal>
        <Modal
                isOpen={readModalIsOpen}
                onRequestClose={closeReadModal}
                className={styles.modal}
                overlayClassName={styles.overlay}
                contentLabel="Read Request Modal">
                <h2 className={styles.modalTitle}>Active assignment details</h2>
                {requestToRead && (
                    <div className={styles.modalContent}>
                        <p><span className={styles.label}>User:</span> <span className={styles.value}>{requestToRead.user_info ? `${requestToRead.user_info.first_name} ${requestToRead.user_info.last_name}` : 'Unknown'}</span></p>
                        <p><span className={styles.label}>Username:</span> <span className={styles.value}>{requestToRead.user_info ? requestToRead.user_info.username : 'Unknown'}</span></p>
                        <p><span className={styles.label}>Equipment:</span> <span className={styles.value}>{requestToRead.equipment_info ? requestToRead.equipment_info.name : 'Unknown'}</span></p>
                        <p><span className={styles.label}>Serial Number:</span> <span className={styles.value}>{requestToRead.equipment_info ? requestToRead.equipment_info.serial_number : 'Unknown'}</span></p>
                        <p><span className={styles.label}>Quantity:</span> <span className={styles.value}>{requestToRead.quantity}</span></p>
                        <p><span className={styles.label}>Assign Date:</span> <span className={styles.value}>{formatDate(requestToRead.assign_date)}</span></p>
                    </div>
                )}
                <div className={styles.modalButtons}>
                    <button onClick={closeReadModal}>Close</button>
                </div>
                </Modal>
        </div>
    );
}
export default Dashboard;

