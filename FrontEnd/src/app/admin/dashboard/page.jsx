"use client"
import styles from './page.module.css';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import toast from 'react-hot-toast';
import Modal from 'react-modal';
import io from 'socket.io-client';
import { MdSearch } from 'react-icons/md';

const Dashboard = () => {
    const [requests, setRequests] = useState([]);
    const [cookies] = useCookies(['accessToken']);
    const [loading, setLoading] = useState(true);
    const [requestToRead, setRequestToRead] = useState(null);
    const [readModalIsOpen, setReadModalIsOpen] = useState(false);
    const [requestToReturn, setRequestsToReturn] = useState(null);
    const [returnModalIsOpen, setReturnModalIsOpen] = useState(false);
    const [returnQuantity, setReturnQuantity] = useState(1);
    const [invalidQuantity, setInvalidQuantity] = useState(0);
    const [currentQuantity] = useState();
    const [searchQuery, setSearchQuery] = useState('');
    const [socket, setSocket] = useState(null);

    const formatDate = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return `${date.toLocaleDateString('hr-HR')} ${date.toLocaleTimeString('hr-HR')}`;
    };

    useEffect(() => {
        Modal.setAppElement('body');
    }, []);

    useEffect(() => {
        const newSocket = io('http://localhost:5001');
        setSocket(newSocket);
        return () => newSocket.close();
    }, [setSocket]);

    const fetchAssignments = useCallback(async () => {
        const token = cookies.accessToken;
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        try {
            const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + "admin/", config);
            setRequests(response.data);
            console.log("Requests:", response.data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }, [cookies.accessToken]);
    
    useEffect(() => {
        fetchAssignments(); 
    }, [fetchAssignments]);

    const returnRequests = async (e, requestId) => {
        e.preventDefault();
        try {
            let token = document.cookie
                .split('; ')
                .find(row => row.startsWith('accessToken'))
                .split('=')[1];
            if (!Number.isInteger(returnQuantity) || returnQuantity <= 0 || returnQuantity > currentQuantity) {
                return;
            }
            await axios.patch(process.env.NEXT_PUBLIC_BASE_URL + `admin/${requestId}`,
                { unassign_quantity: returnQuantity, invalid_quantity: invalidQuantity }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            await fetchAssignments();
            setRequests(prevRequests => prevRequests.map(request => {
                if (request._id === requestId) {
                    return { ...request, unassign_quantity: returnQuantity };
                }
                return request;
            }));
            closeReturnModal();
            toast.success('Equipment returned successfully!', { duration: 3000 });
        } catch (error) {
            console.error("Error:", error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message, { duration: 3000 });
            } else {
                toast.error("Failed to return equipment. Please try again later.", { duration: 3000 });
            }
        }
    };

    const handleReturnEquipment = async () => {
        if (socket) {
            socket.emit('equipmentReturned');
        }
    };

    const openReturnModal = (request) => {
        setRequestsToReturn(request);
        setReturnQuantity(1);
        setInvalidQuantity(0);
        setReturnModalIsOpen(true);
    };
    const closeReturnModal = () => {
        setRequestsToReturn(null);
        setReturnModalIsOpen(false);
    };

    const openReadModal = (request) => {
        setRequestToRead(request);
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
            ) : requests.length === 0 ? (
                <div>
                    <h1 className={styles.empty}>No assigned equipment at the moment.</h1>
                </div>
            ) : (
                <div>
                    <div className={styles.title}>
                        <h1>Assigned Equipment</h1>
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
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.filter(request => 
                                (request.user_info && `${request.user_info.first_name} ${request.user_info.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                (request.equipment_info && request.equipment_info.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            ).map(request => (
                                <tr key={request._id} className={
                                    (requestToRead && request._id === requestToRead._id) || 
                                    (requestToReturn && request._id === requestToReturn._id) 
                                    ? styles.highlightedRow 
                                    : ''
                                }>
                                    <td className={styles.user}>{request.user_info ? `${request.user_info.first_name} ${request.user_info.last_name}` : 'Unknown'}</td>
                                    <td className={styles.equipment}>
                                        <div className={styles.name}>{request.equipment_info.name}</div>
                                        <div className={styles.model}>{request.equipment_info.full_name}</div>
                                </td>
                                    <td className={styles.quantity}>{request.quantity}</td>
                                    <td className={styles.assign_date}>{formatDate(request.assign_date)}</td>
                                    <td>
                                        <button className={styles.return} onClick={() => openReturnModal(request)}>Return</button>
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
                contentLabel="Read Request Modal"
            >
                <h2 className={styles.modalTitle}>Active assignment details</h2>
                {requestToRead && (
                    <div className={styles.modalContent}>
                        <p><span className={styles.label}>User:</span> <span className={styles.value}>{requestToRead.user_info ? `${requestToRead.user_info.first_name} ${requestToRead.user_info.last_name}` : 'Unknown'}</span></p>
                        <p><span className={styles.label}>Username:</span> <span className={styles.value}>{requestToRead.user_info ? requestToRead.user_info.username : 'Unknown'}</span></p>
                        <p><span className={styles.label}>Equipment:</span> <span className={styles.value}>{requestToRead.equipment_info ? requestToRead.equipment_info.name : 'Unknown'}</span></p>
                        <p><span className={styles.label}>Model:</span> <span className={styles.value}>{requestToRead.equipment_info ? requestToRead.equipment_info.full_name : 'Unknown'}</span></p>
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
                contentLabel="Return Assigment Modal"
            >
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
                        <p className={styles.question}> Are you sure you want to return this equipment?</p>
                        <div className={styles.modalButtons}>
                        <button onClick={(e) => { returnRequests(e, requestToReturn._id); handleReturnEquipment(requestToReturn) }}>Confirm</button>
                        <button onClick={closeReturnModal}>Dismiss</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
export default Dashboard;