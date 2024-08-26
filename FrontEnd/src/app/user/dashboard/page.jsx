"use client"
import styles from './page.module.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import Modal from 'react-modal';

const Dashboard = () => {
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
    const [pendingRequests, setPendingRequests] = useState([]);
    const [newQuantity, setNewQuantity] = useState(1);

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
                console.log("Assignments:", response.data);
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

    const readRequests = async (requestId) => {
        try{
            const token = cookies.accessToken;
            const decodedToken = jwtDecode(token);
            let config = {
                headers: {
                    'Authorization': 'Bearer ' + cookies.accessToken
                }
            };
            const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + `user/${requestId}` , config);
            setRequestToRead(response.data);
            setReadModalIsOpen(true);
        } catch (error) {
        console.error("Error:", error);
        toast.error('Error fetching request data!');
        }
    };

    const returnRequests = async (requestId) => {
        try {
            let token = document.cookie
            .split('; ')
            .find(row => row.startsWith('accessToken'))
            .split('=')[1];
            const requestToReturn = requests.find(request => request._id === requestId);

            console.log("Token:", token);
            console.log("Request to Return:", requestToReturn);
            console.log("Return Quantity:", returnQuantity);
            
            if (!Number.isInteger(returnQuantity) || returnQuantity <= 0 || returnQuantity > currentQuantity) {
                toast.error('Invalid return quantity!');
                return;
            }
            await axios.post(
                process.env.NEXT_PUBLIC_BASE_URL + "user/unassignEquipment", 
                 { unassign_quantity: returnQuantity ,
                    equipment_id: requestToReturn.equipment_id
                 },{
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setRequests(prevRequests => prevRequests.map(request => {
            if (request._id === requestId) {
                return { ...request, unassign_quantity: returnQuantity };
            }
            return request;
            }));
            closeReturnModal();
            toast.success('Equipment returned successfully!', { duration: 3000 } );
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error("Error:", error);
            toast.error( error.response.data.message, { duration: 3000 });
        }
    };


   
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

    


    const openReadModal = (request) => {
        setRequestToRead(request);
        setReadModalIsOpen(true);
    };
    const closeReadModal = () => {
        setRequestToRead(null);
        setReadModalIsOpen(false);
    };

    const openReturnModal = (request) => {
        setRequestsToReturn(request);
        setReturnModalIsOpen(true);
    };
    const closeReturnModal = () => {
        setRequestsToReturn(null);
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
                                        <th>QUANTITY</th>
                                        <th>ASSIGN DATE</th>
                                        <th>STATUS</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map(request => (
                                        <tr key={request._id}>
                                            <td className={styles.name}>{request.equipment_info ? request.equipment_info.name : 'Unknown'}</td>
                                            <td className={styles.quantity}>{request.quantity}</td>
                                            <td className={styles.assign_date}>{formatDate(request.assign_date)}</td>
                                            <td className={`${styles.status} ${request.request_status === 'active' ? styles.active : ''}`}>
                                                {request.request_status === 'active' ? 'Active' : request.request_status}
                                            </td>
                                            <td>
                                                <button className={styles.return} onClick={() => openReturnModal(request)}>Return</button>
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
}

export default Dashboard;

