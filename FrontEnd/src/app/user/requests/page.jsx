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
    const [equipmentToCancel, setEquipmentToCancel] = useState(null);
    const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [equipmentToEdit, setEquipmentToEdit] = useState(null);
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [newQuantity, setNewQuantity] = useState(1);
    const [newInvalidQuantity, setNewInvalidQuantity] = useState(0); 
    const [returnPendingRequests, setReturnPendingRequests] = useState([]);
    const [isUnassignRequest, setIsUnassignRequest] = useState(false);

    const formatDate = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return `${date.toLocaleDateString('hr-HR')} ${date.toLocaleTimeString('hr-HR')}`;
    };

    useEffect(() => {
        Modal.setAppElement('body');
    }, []);

    const fetchRequests = async (url, setState) => {
        const token = cookies.accessToken;
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    
        try {
            const response = await axios.get(url, config);
            console.log(`${url} Response:`, response.data);
            setState(response.data);
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        const token = cookies.accessToken;
        if (token) {
            const decodedToken = jwtDecode(token);
            setIsUser({ firstName: decodedToken.firstName, lastName: decodedToken.lastName });
            
            fetchRequests(`${process.env.NEXT_PUBLIC_BASE_URL}user/requests/assignPendingRequests`, setPendingRequests);
            fetchRequests(`${process.env.NEXT_PUBLIC_BASE_URL}user/requests/unassignPendingRequests`, setReturnPendingRequests);
        }
    }, [cookies.accessToken]);
    

    const cancelRequest = async (requestId) => {
        try {
            let token = document.cookie
                .split('; ')
                .find(row => row.startsWith('accessToken'))
                .split('=')[1];
            
            const response = await axios.patch(
                `${process.env.NEXT_PUBLIC_BASE_URL}user/requests/${requestId}`,
                isUnassignRequest ? { cancel_unassign_request: "canceled" } : { cancel_assign_request: "canceled" }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            toast.success(response.data.message, { duration: 3000 });
            
            // Uklanjanje otkazanog zahtjeva iz stanja
            if (isUnassignRequest) {
                setReturnPendingRequests(prevRequests => prevRequests.filter(request => request._id !== requestId));
            } else {
                setPendingRequests(prevRequests => prevRequests.filter(request => request._id !== requestId));
            }
    
            closeCancelModal();
        } catch (error) {
            toast.error(error.response.data.message || "Error");
        }
    };
    

    const editRequest = async (requestId) => {
        try {
            let token = document.cookie
                .split('; ')
                .find(row => row.startsWith('accessToken'))
                .split('=')[1];
    
            const equipmentResponse = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}user/equipment/${equipmentToEdit.equipment_id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            const equipment = equipmentResponse.data;
    
            if (isUnassignRequest) {
                if (newQuantity > equipmentToEdit.quantity) {
                    toast.error('There is not that much equipment assigned!');
                    return;
                }
            } else {
                if (newQuantity > equipment.quantity) {
                    toast.error('Not enough equipment available for assignment!');
                    return;
                }
            }
    
            if (!Number.isInteger(newQuantity) || newQuantity <= 0) {
                toast.error('Invalid quantity!');
                return;
            }
    
            const payload = isUnassignRequest
                ? { new_unassign_quantity: newQuantity, new_invalid_quantity: newInvalidQuantity }
                : { new_assign_quantity: newQuantity };
    
            const response = await axios.patch(
                `${process.env.NEXT_PUBLIC_BASE_URL}user/requests/${requestId}`,
                payload, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            toast.success(response.data.message, { duration: 3000 });
    
            // Ponovno učitavanje zahtjeva
            fetchRequests(`${process.env.NEXT_PUBLIC_BASE_URL}user/requests/assignPendingRequests`, setPendingRequests);
            fetchRequests(`${process.env.NEXT_PUBLIC_BASE_URL}user/requests/unassignPendingRequests`, setReturnPendingRequests);
    
            closeEditModal();
        } catch (error) {
            toast.error(error.response.data.message || "Error updating quantity!");
        }
    };
    

    const openCancelModal = (equipment, isUnassign = false) => {
        setEquipmentToCancel(equipment);
        setIsUnassignRequest(isUnassign);
        setCancelModalIsOpen(true);
    };
    const closeCancelModal = () => {
        setEquipmentToCancel(null);
        setCancelModalIsOpen(false);
    };

    const openEditModal = (equipment, isUnassign = false) => {
        setEquipmentToEdit(equipment);
        setNewQuantity(isUnassign ? equipment.unassign_quantity : equipment.quantity);
        setNewInvalidQuantity(isUnassign ? equipment.invalid_quantity : 0); 
        setIsUnassignRequest(isUnassign);
        setEditModalIsOpen(true);
    };
    const closeEditModal = () => {
        setEquipmentToEdit(null);
        setEditModalIsOpen(false);
    };
    const isQuantityUnchanged = () => {
        if (isUnassignRequest) {
            return (
                equipmentToEdit &&
                newQuantity === equipmentToEdit.unassign_quantity &&
                newInvalidQuantity === equipmentToEdit.invalid_quantity
            );
        } else {
            return (
                equipmentToEdit &&
                newQuantity === equipmentToEdit.quantity
            );
        }
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
                                        <th>MODEL</th>
                                        <th>QUANTITY FOR ASSIGN</th>
                                        <th>ASSIGN DATE</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingRequests.map(request => (
                                        <tr key={request._id} className={
                                            (equipmentToEdit && request._id === equipmentToEdit._id) || 
                                            (equipmentToCancel && request._id === equipmentToCancel._id) 
                                            ? styles.highlightedRow 
                                            : ''
                                        }
                                        >                    
                                            <td className={styles.name}>{request.equipment_info.name}</td>
                                            <td className={styles.model}>{request.equipment_info.serial_number}</td>
                                            <td className={styles.quantity}>{request.quantity}</td>
                                            <td className={styles.assign_date}>{formatDate(request.assign_date)}</td>
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
                                <h1>Unassign Pending Requests</h1>
                            </div>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>EQUIPMENT</th>
                                        <th>MODEL</th>
                                        <th>VALID / INVALID QUANTITY</th>
                                        <th>UNASSIGN DATE</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {returnPendingRequests.map(request => (
                                        <tr key={request._id} className={
                                            (equipmentToEdit && request._id === equipmentToEdit._id) || 
                                            (equipmentToCancel && request._id === equipmentToCancel._id) 
                                            ? styles.highlightedRow 
                                            : ''
                                        }
                                        >                  
                                            <td className={styles.name}>{request.equipment_info.name}</td>
                                            <td className={styles.model}>{request.equipment_info.serial_number}</td>
                                            <td className={styles.quantity}>
                                                {request.unassign_quantity} / {request.invalid_quantity}
                                            </td>
                                            <td className={styles.assign_date}>{formatDate(request.unassign_date)}</td>
                                            <td className={styles.button}>
                                                <button className={styles.return} onClick={() => openEditModal(request, true)}>Edit</button>
                                                <button className={styles.cancel} onClick={() => openCancelModal(request, true)}>Cancel</button>
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
                        <p className={styles.question}>
                            {isUnassignRequest ? 'Are you sure you want to cancel this unassign request?' : 'Are you sure you want to cancel this assign request?'}
                        </p>
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
                        <h2 className={styles.modalTitle}>Edit Request Quantity</h2>
                        {equipmentToEdit && !isUnassignRequest && (
                            <p className={styles.question}>
                                Available Equipment: {equipmentToEdit.equipment_info?.quantity || 0}
                            </p>
                        )}
                        {isUnassignRequest && (
                            <p className={styles.question}>
                                Total Assigned Equipment: {equipmentToEdit.quantity}
                            </p>
                        )}
                        <p className={styles.question}>Current Quantity: {isUnassignRequest ? equipmentToEdit.unassign_quantity : equipmentToEdit.quantity}</p>
                        <p className={styles.question}>Enter new quantity:</p>
                        <input
                            className={styles.input}
                            type="number"
                            value={newQuantity}
                            onChange={(e) => setNewQuantity(parseInt(e.target.value))}
                            min="1"
                        />
                        {isUnassignRequest && (
                            <>  
                                <p className={styles.question}>Enter new invalid quantity:</p>
                                <input
                                    className={styles.input}
                                    type="number"
                                    value={newInvalidQuantity}
                                    onChange={(e) => setNewInvalidQuantity(parseInt(e.target.value))}
                                    min="0"
                                />
                            </>
                        )}
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