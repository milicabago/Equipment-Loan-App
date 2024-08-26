"use client"
import styles from './page.module.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import Modal from 'react-modal';


const Requests = () => {

    const [requests, setRequests] = useState([]);
    const [isUser, setIsUser] = useState(false);
    const [cookies, setCookie, removeCookie] = useCookies(['accessToken']);
    const [loading, setLoading] = useState(true);
    const [requestToRead, setRequestToRead] = useState(null);
    const [readModalIsOpen, setReadModalIsOpen] = useState(false);
    const [requestToReturn, setRequestsToReturn] = useState(null);
    const [returnModalIsOpen, setReturnModalIsOpen] = useState(false);
    const [returnQuantity, setReturnQuantity] = useState(1);
    const [currentQuantity, setCurrentQuantity] = useState();
    const [equipmentToCancel, setEquipmentToCancel] = useState(null);
    const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
    const [equipmentQuantity, setEquipmentQuantity] = useState(1);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [equipmentToEdit, setEquipmentToEdit] = useState(null);
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [newQuantity, setNewQuantity] = useState(1);
    const [returnPendingRequests, setReturnPendingRequests] = useState([]);


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
        if (token) {
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.sub;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
            setIsUser({
                firstName: decodedToken.firstName,
                lastName: decodedToken.lastName
            });
            axios.get(process.env.NEXT_PUBLIC_BASE_URL + "user/", config)
            .then((response) => {
                setRequests(response.data);
                    const pending = response.data.filter(request => request.request_status === 'pending');
                    const returnPending = response.data.filter(request => request.return_status_request === 'pending');
                    setPendingRequests(pending);
                    setReturnPendingRequests(returnPending);
                    setLoading(false);
            })
            .catch((error) => {
                console.error("Error:", error);
                setLoading(false);
            }); 
            axios.get(process.env.NEXT_PUBLIC_BASE_URL + "user/equipment/pendingRequests" , config)
            .then((response) => {
                setPendingRequests(response.data);
                console.log("Pending Requests:", response.data);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
            
        }
    }, [cookies.accessToken]);

    const cancelRequest = async (requestId) => {
        try {
            let token = document.cookie
            .split('; ')
            .find(row => row.startsWith('accessToken'))
            .split('=')[1];
            const response = await axios.patch(
                `${process.env.NEXT_PUBLIC_BASE_URL}user/equipment/request/${requestId}`,
                { return_status_request: "canceled" }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            toast.success(response.data.message, { duration: 3000 });
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            toast.error(error.response.data.message || "Error" );
        }
    };


    const editRequest = async (requestId) => {
        try {
            let token = document.cookie
            .split('; ')
            .find(row => row.startsWith('accessToken'))
            .split('=')[1];
            if (!Number.isInteger(newQuantity) || newQuantity <= 0) {
                toast.error('Invalid quantity!');
                return;
            }
            const response = await axios.patch(
                `${process.env.NEXT_PUBLIC_BASE_URL}user/equipment/request/${requestId}`,
                { new_quantity: newQuantity }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            toast.success('Quantity updated successfully!', { duration: 3000 });
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            setRequests(prevRequests => prevRequests.map(request => {
                if (request._id === requestId) {
                    console.log("Updating request:", request._id, "with new quantity:", newQuantity);
                    return { ...request, quantity: newQuantity };
                }
                return request;
            }));
            closeEditModal();
        } catch (error) {
            toast.error(error.response.data.message || "Error updating quantity" );
        }
    };

    const openCancelModal = (equipment) => {
        setEquipmentToCancel(equipment);
        setCancelModalIsOpen(true);
    };
        const closeCancelModal = () => {
        setEquipmentToCancel(null);
        setCancelModalIsOpen(false);
    };


    const openEditModal = (equipment) => {
        setEquipmentToEdit(equipment);
        setNewQuantity(equipment.quantity);
        setEditModalIsOpen(true);
    };
    const closeEditModal = () => {
        setEquipmentToEdit(null);
        setEditModalIsOpen(false);
    };
    const isQuantityUnchanged = () => {
        return equipmentToEdit && newQuantity === equipmentToEdit.quantity;
    };
    
    return (
        <div className={styles.container}>
            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                </div>
            ) : pendingRequests.length === 0 && returnPendingRequests.length === 0 ? (
                <div>
                    <h1 className={styles.empty}>No pending requests at the moment.</h1>
                </div>
            ) : (
                <div>
                    {pendingRequests.length > 0 && (
                        <>
                            <div className={styles.title}>
                                <h1>Assign Pending Requests</h1>
                            </div>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>EQUIPMENT</th>
                                        <th>QUANTITY</th>
                                        <th>ASSIGN DATE</th>
                                        <th>STATUS</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingRequests.map(request => (
                                        <tr key={request._id}>
                                            <td className={styles.name}>{request.equipment_info.name}</td>
                                            <td className={styles.quantity}>{request.quantity}</td>
                                            <td className={styles.assign_date}>{formatDate(request.updatedAt)}</td>
                                            <td className={`${styles.request_status} ${request.request_status === 'pending' ? styles.active : ''}`}>
                                                {request.request_status === 'pending' ? 'Pending' : request.request_status}
                                            </td>
                                            <td className={styles.button}>
                                                <button className={styles.return} onClick={() => openEditModal(request)}>Edit</button>
                                                <button className={styles.cancel} onClick={() => openCancelModal(request)}>Cancel</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </>
                        )}
                        {returnPendingRequests.length > 0 && (
                            <>
                                    <div className={styles.title}>
                                        <h1> UnassignPending Requests</h1>
                                    </div>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>EQUIPMENT</th>
                                                <th>QUANTITY</th>
                                                <th>ASSIGN DATE</th>
                                                <th>RETURN STATUS</th>
                                                <th>ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {returnPendingRequests.map(request => (
                                                <tr key={request._id}>
                                                    <td className={styles.name}>{request.equipment_info.name}</td>
                                                    <td className={styles.quantity}>{request.quantity}</td>
                                                    <td className={styles.assign_date}>{formatDate(request.updatedAt)}</td>
                                                    <td className={`${styles.request_status} ${request.return_status_request === 'pending' ? styles.active : ''}`}>
                                                        {request.return_status_request === 'pending' ? 'Pending' : request.return_status_request}
                                                    </td>
                                                    <td className={styles.button}>
                                                        <button className={styles.return} onClick={() => openEditModal(request)}>Edit</button>
                                                        <button className={styles.cancel} onClick={() => openCancelModal(request)}>Cancel</button>
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
                isOpen={cancelModalIsOpen}
                onRequestClose={closeCancelModal}
                className={styles.modal}
                overlayClassName={styles.overlay}
                contentLabel="Cancel Assigment Modal" >
                <h2 className={styles.modalTitle}>Cancel Assigment</h2>
                {equipmentToCancel && (
                    <div>
                        <p className={styles.question}> Are you sure you want to cancel this request?</p>
                        <div className={styles.modalButtons}>
                            <button className={styles.accept} onClick={() => cancelRequest(equipmentToCancel._id)}>Confirm</button>
                            <button onClick={closeCancelModal}>Dismiss</button>
                        </div>
                    </div>
                )}
            </Modal>
            
            <Modal
                isOpen={editModalIsOpen}
                onRequestClose={closeEditModal}
                contentLabel="Edit Equipment"
                className={styles.modal}
                overlayClassName={styles.overlay}
            >
                {equipmentToEdit && (
                    <div>
                        <h2 className={styles.modalTitle}>Edit Equipment Quantity</h2>
                        <p className={styles.question}>Current Quantity: {equipmentToEdit.quantity}</p>
                        <p className={styles.question}>Enter new quantity:</p>
                        <input 
                            className={styles.input}
                            type="number" 
                            value={newQuantity} 
                            onChange={(e) => setNewQuantity(parseInt(e.target.value))}
                            min="1"
                        />
                        <div className={styles.modalButtons}>
                            <button onClick={() => editRequest(equipmentToEdit._id)} disabled={isQuantityUnchanged()}>Save Changes</button>                            
                            <button onClick={closeEditModal}>Dismiss</button>
                        </div>
                    </div>
                )}
            </Modal>
                    
        </div>

    );
};

export default Requests;

