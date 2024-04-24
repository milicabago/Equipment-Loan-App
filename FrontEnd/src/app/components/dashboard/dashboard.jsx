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



    useEffect(() => {
        const token = cookies.accessToken;
        if (token) {
            const decodedToken = jwtDecode(token);
            let config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
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
        const config = {
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
            <Modal
                isOpen={readModalIsOpen}
                onRequestClose={closeReadModal}
                className={styles.modal}
                overlayClassName={styles.overlay}
                contentLabel="Read Request Modal"
                >
                <h2 className={styles.modalTitle}>Request Details</h2>
                {requestToRead && (
                    <div className={styles.modalContent}>
                    <p>User: {requestToRead.user_info.first_name} {requestToRead.user_info.last_name}</p>
                    <p>Username: {requestToRead.user_info.username}</p>
                    <p>Equipment: {requestToRead.equipment_info.name}</p>
                    <p>Serial Number: {requestToRead.equipment_info.serial_number}</p>
                    <p>Quantity: {requestToRead.quantity}</p>
                    <p>Date: {requestToRead.assign_date}</p>
                    
                    </div>
                )}
                <div className={styles.modalButtons}>
                    <button onClick={closeReadModal}>Close</button>
                </div>
                </Modal>
            
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
                                    <td className={styles.assign_date}>{item.assign_date}</td>
                                    <td className={styles.status}>{item.request_status}</td>
                                    <td>
                                        <button className={styles.delete} onClick={() => openDeleteModal(item._id)}>Delete</button>
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
            contentLabel="Delete  Request Confirmation Modal"
        >
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
        </div>
    );
}

export default Dashboard;

