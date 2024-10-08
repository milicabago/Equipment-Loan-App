"use client";
import styles from './page.module.css';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import toast from 'react-hot-toast';
import Modal from 'react-modal';

const Dashboard = () => {
    const [requests, setRequests] = useState([]);
    const [cookies] = useCookies(['accessToken']);
    const [loading, setLoading] = useState(true);
    const [requestToRead, setRequestToRead] = useState(null);
    const [readModalIsOpen, setReadModalIsOpen] = useState(false);
    const [requestToReturn, setRequestToReturn] = useState(null);
    const [returnModalIsOpen, setReturnModalIsOpen] = useState(false);
    const [returnQuantity, setReturnQuantity] = useState(1);
    const [invalidQuantity, setInvalidQuantity] = useState(0); 
    const [currentQuantity] = useState();

    const formatDate = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return `${date.toLocaleDateString('hr-HR')} ${date.toLocaleTimeString('hr-HR')}`;
    };

    const fetchRequests = useCallback(async () => {
        const token = cookies.accessToken; 
        if (!token) return;
    
        setLoading(true); 
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}user/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(response.data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    }, [cookies.accessToken]);
    
    useEffect(() => {
        Modal.setAppElement('body'); 
        fetchRequests(); 
    }, [fetchRequests]);
    
    const returnRequests = async (requestId) => {
        try {
            const token = cookies.accessToken;
            const requestToReturn = requests.find(request => request._id === requestId);
    
            if (!Number.isInteger(returnQuantity) || returnQuantity <= 0 || returnQuantity > currentQuantity) {
                toast.error(error.response.data.message, { duration: 3000 });
                return;
            }
            await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}user/unassignEquipment`,
                {
                    unassign_quantity: returnQuantity,
                    invalid_quantity: invalidQuantity,
                    equipment_id: requestToReturn.equipment_id
                }, {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );    
            closeReturnModal();
            toast.success('Request for return successfully sent!', { duration: 3000 });
            fetchRequests();
        } catch (error) {
            toast.error(error.response.data.message, { duration: 3000 });
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
    const openReturnModal = (request) => {
        setRequestToReturn(request);
        setReturnQuantity(1);
        setInvalidQuantity(0);
        setReturnModalIsOpen(true);
    };
    const closeReturnModal = () => {
        setRequestToReturn(null);
        setReturnModalIsOpen(false);
    };

    return (
        <div className={styles.container}>
            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                </div>
            ) : requests.length === 0 ? (
                <div>
                    <h1 className={styles.empty}>No assigned equipment at the moment.</h1>
                </div>
            ) : (
                <div>
                    {requests.length > 0 && (
                        <>
                            <div className={styles.title}>
                                <h1>Assigned Equipment</h1>
                            </div>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>EQUIPMENT</th>
                                        <th>ASSIGNED QUANTITY</th>
                                        <th>RETURN QUANTITY</th>
                                        <th>ASSIGN DATE</th>
                                        <th>STATUS</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map(request => (
                                        <tr key={request._id} className={
                                            (requestToRead && request._id === requestToRead._id) || 
                                            (requestToReturn && request._id === requestToReturn._id) 
                                            ? styles.highlightedRow 
                                            : ''
                                        }
                                        >                                            
                                            <td className={styles.name}>{request.equipment_info ? request.equipment_info.name : 'Unknown'}</td>
                                            <td className={styles.quantity}>{request.quantity}</td>
                                            <td className={styles.quantity}>{request.unassign_quantity}</td>
                                            <td className={styles.assign_date}>{formatDate(request.assign_date)}</td>
                                            <td className={`${styles.status} ${request.request_status === 'active' ? styles.active : ''}`}>
                                                {request.return_status_request === 'pending' ? 'Pending' : 
                                                (request.request_status === 'active' ? 'Active' : request.request_status)}
                                            </td>
                                            <td>
                                                <button 
                                                    className={styles.return} 
                                                    onClick={() => openReturnModal(request)} 
                                                    disabled={request.return_status_request === 'pending'}
                                                >
                                                    Return
                                                </button>
                                                <button className={styles.seeMore} onClick={() => openReadModal(request)}>See More</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            )}
            <Modal
                isOpen={readModalIsOpen}
                onRequestClose={closeReadModal}
                className={styles.modal}
                overlayClassName={styles.overlay}
                contentLabel="Read Request Modal"
            >
                <h2 className={styles.modalTitle}>Request details</h2>
                {console.log('requestToRead:', requestToRead)}
                {requestToRead && (
                    <div className={styles.modalContent}>
                        <p><span className={styles.label}>Equipment:</span> <span className={styles.value}>{requestToRead.equipment_info ? requestToRead.equipment_info.name : 'Unknown'}</span></p>
                        <p><span className={styles.label}>Serial Number:</span> <span className={styles.value}>{requestToRead.equipment_info ? requestToRead.equipment_info.serial_number : 'Unknown'}</span></p>
                        <p><span className={styles.label}>Quantity:</span> <span className={styles.value}>{requestToRead.quantity}</span></p>
                        <p><span className={styles.label}>Request Sent:</span> <span className={styles.value}>{formatDate(requestToRead.createdAt)}</span></p>
                        <p><span className={styles.label}>Request Accepted:</span> <span className={styles.value}>{formatDate(requestToRead.assign_date)}</span></p>
                    </div>
                )}
                <div className={styles.modalButtons}>
                    <button onClick={closeReadModal}>Close</button>
                </div>
            </Modal>

            <Modal
                isOpen={returnModalIsOpen}
                onRequestClose={closeReturnModal}
                className={styles.modal}
                overlayClassName={styles.overlay}
                contentLabel="Return Assigment Modal" >
                <h2 className={styles.modalTitle}>Return Assigment</h2>
                {requestToReturn && (
                    <div>
                        <p className={styles.question}>Current quantity: {requestToReturn.quantity}</p>
                        <label className={styles.question} htmlFor="returnQuantity">Quantity to return:</label>
                        <input className={styles.input}
                            type="number"
                            id="returnQuantity"
                            min="1"
                            max={requestToReturn.quantity}
                            value={returnQuantity}
                            onChange={(e) => setReturnQuantity(parseInt(e.target.value))}
                        />
                        <label className={styles.question} htmlFor="invalidQuantity">Invalid quantity:</label>
                        <input className={styles.input}
                            type="number"
                            id="invalidQuantity"
                            min="0"
                            max={returnQuantity}
                            value={invalidQuantity}
                            onChange={(e) => setInvalidQuantity(parseInt(e.target.value))}
                        />
                        <p className={styles.question}> Would you like to send a request to return the equipment?</p>
                        <div className={styles.modalButtons}>
                            <button onClick={() => returnRequests(requestToReturn._id)}>Confirm</button>
                            <button onClick={closeReturnModal}>Dismiss</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Dashboard;