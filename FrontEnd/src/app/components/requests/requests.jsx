"use client"
import styles from './requests.module.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import Modal from 'react-modal';

const Request = () => {
    const [requests, setRequests] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [cookies, setCookie, removeCookie] = useCookies(['accessToken']);
    const [loading, setLoading] = useState(true);
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
                axios.get(process.env.NEXT_PUBLIC_BASE_URL + "admin/requests", config)
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

          const readRequests = async (requestId) => {
            try{
                const token = cookies.accessToken;
                const decodedToken = jwtDecode(token);
                const config = {
                headers: {
                    'Authorization': 'Bearer ' + cookies.accessToken
                }
                };
                const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + `admin/requests${requestId}` , config);
                setRequestToRead(response.data);
                setReadModalIsOpen(true);
            } catch (error) {
                console.error("Error:", error);
                toast.error('Error fetching item data!');
            }
        
            };
            const openReadModal = (request) => {
                setRequestToRead(request);
                setReadModalIsOpen(true);
              };
            
              const closeReadModal = () => {
                setRequestToRead(null);
                setReadModalIsOpen(false);
              };

              const acceptRequests = async (requestId) => {
                try{
                    const token = cookies.accessToken;
                    const decodedToken = jwtDecode(token);
                    const config = {
                    headers: {
                        'Authorization': 'Bearer ' + cookies.accessToken
                    }
                    };
                    const response = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL + `admin/requests/activate/${requestId}`, config);
                    toast.success('Request accepted!');
                    const newRequests = requests.filter(request => request._id !== requestId);
                    setRequests(newRequests);
                }
                catch (error) {
                    console.error("Error:", error);
                    toast.error('Error accepting request!');
                }
            }
            const rejectRequests = async (requestId) => {
                try {
                    const token = cookies.accessToken;
                    const decodedToken = jwtDecode(token);
                    const config = {
                        headers: {  
                            'Authorization': 'Bearer' + cookies.accessToken
                        }
                    };
                    const response = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL + `admin/requests/deny/${requestId}`, config);
                    toast.success('Request rejected!');
                    const newRequests = requests.filter(request => request._id !== requestId);
                    setRequests(newRequests);
                }
                catch (error) {
                    console.error("Error:", error);
                    toast.error('Error rejecting request!');
                }
            }

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
                  <h1>Svi zahtjevi</h1>
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
                            {requests.map(request => (
                                <tr key={request._id}>
                                    <td>{request.user_info ? `${request.user_info.first_name} ${request.user_info.last_name}` : 'Unknown'}</td>
                                    <td>{request.equipment_info ? request.equipment_info.name : 'Unknown'}</td>
                                    <td>{request.quantity}</td>
                                    <td>{request.assign_date}</td>
                                    <td>{request.request_status}</td>
                                    <td>
                                        <button className={styles.accept} onClick={() => acceptRequests(request._id)}>Accept</button>
                                        <button className={styles.reject} onClick={() => rejectRequests(request._id)}>Reject</button>
                                        <button className={styles.seeMore} onClick={() => openReadModal(request)}>See More</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                
            </div>
        )}
    </div>
);
}
export default Request;


