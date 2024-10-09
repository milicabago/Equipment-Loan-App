"use client"
import styles from './page.module.css';
import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import io from 'socket.io-client';
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import { MdSearch } from "react-icons/md";

const RequestPage = () => {
    const [cookies] = useCookies(['accessToken']);
    const [loading, setLoading] = useState(true);
    const [requestToRead, setRequestToRead] = useState(null);
    const [readModalIsOpen, setReadModalIsOpen] = useState(false);
    const [requestToAccept, setRequestToAccept] = useState(null);
    const [acceptModalIsOpen, setAcceptModalIsOpen] = useState(false);
    const [requestToDeny, setRequestToDeny] = useState(null);
    const [denyModalIsOpen, setDenyModalIsOpen] = useState(false);
    const [socket, setSocket] = useState(null);
    const [assignRequests, setAssignRequests] = useState([]);
    const [unassignRequests, setUnassignRequests] = useState([]);
    const [isAssign, setIsAssign] = useState(false); 
    const [isUnassign, setIsUnassign] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const formatDate = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return `${date.toLocaleDateString('hr-HR')} ${date.toLocaleTimeString('hr-HR')}`;
    };

    useEffect(() => {
        const newSocket = io(process.env.NEXT_PUBLIC_BASE_URL);
        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [setSocket]);

    const fetchAssignRequests = async () => {
        const token = cookies.accessToken;
        if (token) {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            try {
                const assignResponse = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}admin/requests/assignPendingRequests`, config);
                setAssignRequests(assignResponse.data);
                console.log("Assign Requests:", assignResponse.data); // Ispisati odgovore
                setLoading(false);
            } catch (error) {
                console.error("Error fetching assign requests:", error);
                setLoading(false);
            }
        }
    };
    
    const fetchUnassignRequests = async () => {
        const token = cookies.accessToken;
        if (token) {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            try {
                const unassignResponse = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}admin/requests/unassignPendingRequests`, config);
                setUnassignRequests(unassignResponse.data);
                console.log("Unassign Requests:", unassignResponse.data); // Ispisati odgovore
                setLoading(false);
            } catch (error) {
                console.error("Error fetching unassign requests:", error);
                setLoading(false);
            }
        }
    };
    
    useEffect(() => {
        fetchAssignRequests(); 
        fetchUnassignRequests(); 
    }, [cookies.accessToken]);
    

    const acceptRequests = async (requestId, isAssign) => {
        try {
            const token = cookies.accessToken;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const requestBody = isAssign ? { request_status: 'active' } : { return_status_request: 'active' };
            const response = await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}admin/requests/${requestId}`, requestBody, config);

            if (isAssign) {
                setAssignRequests(prevRequests => prevRequests.filter(request => request._id !== requestId));
            } else {
                setUnassignRequests(prevRequests => prevRequests.filter(request => request._id !== requestId));
            }
            closeAcceptModal();
            toast.success(response.data.message, { duration: 3000 });

            if (socket) {
                socket.emit('equipmentAcceptOrDeny', { requestId, status: 'active' });
            }
            fetchRequests(); 
        } catch (error) {
            console.error("Error accepting request:", error);
        }
    };

    const denyRequests = async (requestId, isUnassign) => {
        try {
            const token = cookies.accessToken;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const requestBody = isUnassign ? { return_status_request: 'denied' } : { request_status: 'denied' };
            const response = await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}admin/requests/${requestId}`, requestBody, config);

            if (isUnassign) {
                setUnassignRequests(prevRequests => prevRequests.filter(request => request._id !== requestId));
            } else {
                setAssignRequests(prevRequests => prevRequests.filter(request => request._id !== requestId));
            }
            closeDenyModal(); 
            toast.success(response.data.message, { duration: 3000 });

            if (socket) {
                socket.emit('equipmentAcceptOrDeny', { requestId, status: 'denied' });
            }
            fetchRequests();
        } catch (error) {
            console.error("Error denying request:", error);
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

    const openAcceptModal = (request, isAssign) => {
        setRequestToAccept(request);
        setAcceptModalIsOpen(true);
        setIsAssign(isAssign); 
    };
    const closeAcceptModal = () => {
        setRequestToAccept(null);
        setAcceptModalIsOpen(false);
    };

    const openDenyModal = (request, isUnassign) => {
        setRequestToDeny(request);
        setDenyModalIsOpen(true);
        setIsUnassign(isUnassign); 
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
                {assignRequests.length === 0 && unassignRequests.length === 0 ? (
                    <h1 className={styles.empty}>No requests at the moment.</h1>    
                ) : (
                    <>
                        {assignRequests.length > 0 && (
                            <>
                                <div className={styles.title}>
                                    <h1>Assign Requests</h1>
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
                                            <th>QUANTITY TO ASSIGN</th>
                                            <th>ASSIGN DATE</th>
                                            <th>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assignRequests.filter(request =>
                                            (request.user_info && `${request.user_info.first_name} ${request.user_info.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                            (request.equipment_info && request.equipment_info.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                        ).map(request => (
                                            <tr key={request._id} className={
                                                (requestToAccept && request._id === requestToAccept._id) || 
                                                (requestToDeny && request._id === requestToDeny._id) ||
                                                (requestToRead && request._id === requestToRead._id)
                                                ? styles.highlightedRow 
                                                : ''
                                            }>                  
                                                <td className={styles.name}>{request.user_info ? `${request.user_info.first_name} ${request.user_info.last_name}` : 'Unknown'}</td>
                                                <td className={styles.equipment}>{request.equipment_info ? request.equipment_info.name : 'Unknown'}</td>
                                                <td className={styles.quantity}>{request.quantity}</td>
                                                <td className={styles.date}>{formatDate(request.assign_date)}</td>
                                                <td className={styles.action}>
                                                    <button className={styles.accept} onClick={() => openAcceptModal(request, true)}>Accept</button>
                                                    <button className={styles.deny} onClick={() => openDenyModal(request, false)}>Deny</button>
                                                    <button className={styles.seeMore} onClick={() => openReadModal(request)}>See More</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}

                        {unassignRequests.length > 0 && (
                            <>
                                <div className={styles.title}>
                                    <h1>Unassign Requests</h1>
                                </div>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>USER</th>
                                            <th>EQUIPMENT</th>
                                            <th>VALID / INVALID QUANTITY</th>
                                            <th>UNASSIGN DATE</th>
                                            <th>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {unassignRequests.filter(request =>
                                            (request.user_info && `${request.user_info.first_name} ${request.user_info.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                            (request.equipment_info && request.equipment_info.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                        ).map(request => (
                                            <tr key={request._id} className={
                                                (requestToAccept && request._id === requestToAccept._id) || 
                                                (requestToDeny && request._id === requestToDeny._id) ||
                                                (requestToRead && request._id === requestToRead._id)
                                                ? styles.highlightedRow 
                                                : ''
                                            }>             
                                                <td className={styles.name}>{request.user_info ? `${request.user_info.first_name} ${request.user_info.last_name}` : 'Unknown'}</td>
                                                <td className={styles.equipment}>{request.equipment_info ? request.equipment_info.name : 'Unknown'}</td>
                                                <td className={styles.quantity}>
                                                    {request.unassign_quantity} / {request.invalid_quantity}
                                                </td>
                                                <td className={styles.date}>{formatDate(request.unassign_date)}</td>
                                                <td className={styles.action}>
                                                    <button className={styles.accept} onClick={() => openAcceptModal(request, false)}>Accept</button>
                                                    <button className={styles.deny} onClick={() => openDenyModal(request, true)}>Deny</button>
                                                    <button className={styles.seeMore} onClick={() => openReadModal(request)}>See More</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </>
                )}
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
                        <p><span className={styles.label}>Username:</span> <span className={styles.value}>{requestToRead.user_info.username}</span></p>
                        <p><span className={styles.label}>Equipment:</span> <span className={styles.value}>{requestToRead.equipment_info ? requestToRead.equipment_info.name : 'Unknown'}</span></p>
                        <p><span className={styles.label}>Model:</span> <span className={styles.value}>{requestToRead.equipment_info ? requestToRead.equipment_info.full_name : 'Unknown'}</span></p>
                        <p><span className={styles.label}>Serial Number:</span> <span className={styles.value}>{requestToRead.equipment_info ? requestToRead.equipment_info.serial_number : 'Unknown'}</span></p>
                        {requestToRead.unassign_date ? (
                            <>
                                <p><span className={styles.label}>Quantity:</span> <span className={styles.value}>{requestToRead.unassign_quantity}</span></p>

                                <p><span className={styles.label}>Invalid Quantity:</span> <span className={styles.value}>{requestToRead.invalid_quantity}</span></p>
                                <p><span className={styles.label}>Unassign Date:</span> <span className={styles.value}>{formatDate(requestToRead.unassign_date)}</span></p>
                            </>
                        ) : (
                            <>
                                <p><span className={styles.label}>Quantity:</span> <span className={styles.value}>{requestToRead.quantity}</span></p>
                                <p><span className={styles.label}>Available Quantity:</span>{requestToRead.equipment_info.quantity}<span></span></p>

                                <p><span className={styles.label}>Assign Date:</span> <span className={styles.value}>{formatDate(requestToRead.assign_date)}</span></p>
                            </>
                        )}

                        <div className={styles.modalButtons}>
                            <button onClick={closeReadModal}>Close</button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={acceptModalIsOpen}
                onRequestClose={closeAcceptModal}
                className={styles.modal}
                overlayClassName={styles.overlay}
                contentLabel="Accept Request Modal" >
                <h2 className={styles.modalTitle}>Accept request?</h2>
                <div className={styles.modalContent}>
                    <p>Are you sure you want to accept this request?</p>
                    <div className={styles.modalButtons}>
                        <button className={styles.accept} onClick={() => acceptRequests(requestToAccept._id, isAssign)}>Accept</button> {/* Use isAssign flag */}
                        <button className={styles.closeButton} onClick={closeAcceptModal}>Cancel</button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={denyModalIsOpen}
                onRequestClose={closeDenyModal}
                className={styles.modal}
                overlayClassName={styles.overlay}
                contentLabel="Deny Request Modal" >
                <h2 className={styles.modalTitle}>Deny request?</h2>
                <div className={styles.modalContent}>
                    <p>Are you sure you want to deny this request?</p>
                    <div className={styles.modalButtons}>
                        <button className={styles.deny} onClick={() => denyRequests(requestToDeny._id, isUnassign)}>Deny</button> {/* Use isUnassign flag */}
                        <button className={styles.closeButton} onClick={closeDenyModal}>Cancel</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default RequestPage;