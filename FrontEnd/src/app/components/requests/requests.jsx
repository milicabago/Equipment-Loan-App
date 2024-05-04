"use client"
import styles from './requests.module.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import Modal from 'react-modal';

const Request = () => {
    const [requests, setRequests] = useState([]);
    const [cookies] = useCookies(['accessToken']);
    const [loading, setLoading] = useState(true);
    const [requestToRead, setRequestToRead] = useState(null);
    const [readModalIsOpen, setReadModalIsOpen] = useState(false);
    const [requestToAccept, setRequestToAccept] = useState(null);
    const [acceptModalIsOpen, setAcceptModalIsOpen] = useState(false);
    const [requestToDeny, setRequestToDeny] = useState(null);
    const [denyModalIsOpen, setDenyModalIsOpen] = useState(false);
    const formatDate = (dateTimeString) => {
        const date = new Date(dateTimeString);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString();
        return `${formattedDate} ${formattedTime}`;
    };

    useEffect(() => {
        const token = cookies.accessToken;
        if (token) {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
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
        }, [cookies.accessToken]);

    const readRequests = async (requestId) => {
        try{
            const token = cookies.accessToken;
            const config = {
                headers: {
                    'Authorization': 'Bearer ' + token
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

    const acceptRequests = async (requestId) => {
        try {
            let token = document.cookie
            .split('; ')
            .find(row => row.startsWith('accessToken'))
            .split('=')[1];
    
            await axios.patch(
                process.env.NEXT_PUBLIC_BASE_URL + `admin/requests/${requestId}`, 
                { request_status: 'active' },{
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
                
            );
    
            setRequests(prevRequests => prevRequests.map(request => {
                if (request._id === requestId) {
                    return { ...request, request_status: 'active' };
                }
                return request;
            }));
    
            closeAcceptModal();
            toast.success('Request accepted successfully!');
            window.location.reload();
        } catch (error) {
            console.error("Error:", error);
            toast.error('Error accepting request!');
        }
    };

    const denyRequests = async (requestId) => {
        try {
            let token = document.cookie
            .split('; ')
            .find(row => row.startsWith('accessToken'))
            .split('=')[1];
    
            await axios.patch(
                process.env.NEXT_PUBLIC_BASE_URL + `admin/requests/${requestId}`, 
                { request_status: 'denied' },{
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
                
            );
    
            setRequests(prevRequests => prevRequests.map(request => {
                if (request._id === requestId) {
                    return { ...request, request_status: 'denied' };
                }
                return request;
            }));
    
            closeDenyModal();
            toast.success('Request denied successfully!');
            window.location.reload();
        } catch (error) {
            console.error("Error:", error);
            toast.error('Error denying request!');
        }
    };
    
;
            


    const openReadModal = (request) => {
        setRequestToRead(request);
        setReadModalIsOpen(true);
    };
    const closeReadModal = () => {
        setRequestToRead(null);
        setReadModalIsOpen(false);
    };
    const openAcceptModal = (request) => {
        setRequestToAccept(request);
        setAcceptModalIsOpen(true);
    };
    const closeAcceptModal = () => {
        setRequestToAccept(null);
        setAcceptModalIsOpen(false);
    };
    const openDenyModal = (request) => {
        setRequestToDeny(request);
        setDenyModalIsOpen(true);
    };
    const closeDenyModal = () => {
        setRequestToDeny(null);
        setDenyModalIsOpen(false);
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
                        <h1>Requests</h1>
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
                                        <td className={styles.name}>{request.user_info ? `${request.user_info.first_name} ${request.user_info.last_name}` : 'Unknown'}</td>
                                        <td className={styles.equipment}>{request.equipment_info ? request.equipment_info.name : 'Unknown'}</td>
                                        <td className={styles.quantity}>{request.quantity}</td>
                                        <td className={styles.date}>{formatDate(request.assign_date)}</td>
                                        
                                        <td className={`${styles.status} ${request.request_status === 'pending' ? styles.active : ''}`}>
                                            {request.request_status === 'pending' ? 'Pending..' : request.request_status}
                                        </td>
                                        <td className={styles.action}>
                                            <button className={styles.accept} onClick={() => openAcceptModal(request)}>Accept</button>
                                            <button className={styles.read} onClick={() => openDenyModal(request)}>Deny</button>
                                            <button className={styles.seeMore} onClick={() => openReadModal(request)}>See More</button>
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
                contentLabel="Read Request Modal" >
                <h2 className={styles.modalTitle}>Pending request details</h2>
                {requestToRead && (
                    
                    <div className={styles.modalContent}>
                        <p><span className={styles.label}>User:</span> <span className={styles.value}>{requestToRead.user_info.first_name} {requestToRead.user_info.last_name}</span></p>
                        <p><span className={styles.label}>Username:</span> <span className={styles.value}>{requestToRead.user_info.username}</span> </p>
                        <p><span className={styles.label}>Equipment:</span> <span className={styles.value}>{requestToRead.equipment_info ? requestToRead.equipment_info.name : 'N/A'}</span></p>
                        <p><span className={styles.label}>Quantity:</span> <span className={styles.value}>{requestToRead.quantity}</span></p>
                        <p><span className={styles.label}>Date:</span> <span className={styles.value}>{formatDate(requestToRead.assign_date)}</span></p>
                    </div>
                )}
                <div className={styles.modalButtons}>
                    <button onClick={closeReadModal}>Close</button>
                </div>
            </Modal>
            <Modal
                isOpen={acceptModalIsOpen}
                onRequestClose={closeAcceptModal}
                className={styles.modal}
                overlayClassName={styles.overlay}
                contentLabel="Accept Request Modal" >
                <h2 className={styles.modalTitle}>Accept Request</h2>
                {requestToAccept && (
                    <div>
                        <p> Are you sure you want to accept this request?</p>
                        <div className={styles.modalButtons}>
                            <button className={styles.accept} onClick={() => acceptRequests(requestToAccept._id)}>Accept</button>
                            <button onClick={closeAcceptModal}>Close</button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={denyModalIsOpen}
                onRequestClose={closeDenyModal}
                className={styles.modal}
                overlayClassName={styles.overlay}
                contentLabel="Deny Request Modal" >
                <h2 className={styles.modalTitle}>Deny Request</h2>
                {requestToDeny && (
                    <div>
                        <p> Are you sure you want to deny this request?</p>
                        <div className={styles.modalButtons}>
                            <button className={styles.deny} onClick={() => denyRequests(requestToDeny._id)}>Deny</button>
                            <button onClick={closeDenyModal}>Close</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
export default Request;