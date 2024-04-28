"use client"
import styles from './mySettings.module.css';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import Modal from 'react-modal';

const MySettings = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['accessToken']);
    const [user, setUser] = useState(null);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userToEdit, setUserToEdit] = useState(null)
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);

    const formatDate = (dateTimeString) => {
        const date = new Date(dateTimeString);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString();
        return `${formattedDate} ${formattedTime}`;
    };

    const openEditModal = (user) => {
        setUserToEdit(user);
        setEditModalIsOpen(true);
    };
    const closeEditModal = () => {
        setEditModalIsOpen(false);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserToEdit((prevUser) => ({ ...prevUser, [name]: value }));
    };
    const editUser = async () => {
        try {
            const token = cookies.accessToken;
            let config = {
                headers: {
                    'Authorization': 'Bearer ' + token
                },
            };
            await axios.put(process.env.NEXT_PUBLIC_BASE_URL + `user/settings`, userToEdit, config);
            setEditModalIsOpen(false);
            window.location.reload();
        } catch (error) {
            console.error('Error:', error);
        }
    };


    useEffect(() => {
        const token = cookies.accessToken;
        const config = {
            headers: {
                'Authorization': 'Bearer ' + token
            },
        };
        axios.get(process.env.NEXT_PUBLIC_BASE_URL + 'user/settings', config)
            .then(response => {
                setUser(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching user:', error);
                setLoading(false);
            });
    }, [ cookies.accessToken ]);

    return (
        <div className={styles.container}>
            <Modal
                isOpen={editModalIsOpen}
                onRequestClose={closeEditModal}
                className={styles.modal}
                overlayClassName={styles.overlay}
                contentLabel="Edit User Modal"
                >
                <h2 className={styles.modalTitle}>Edit User</h2>
                {userToEdit && (
                    <div className={styles.modalContent}>
                        <label htmlFor="first_name" className={styles.labels}>Ime:</label>
                        <input 
                            type="text"
                            name="first_name"
                            value={userToEdit && userToEdit.first_name}
                            onChange={handleInputChange}
                            className={styles.values}
                        />
                        <label htmlFor="last_name" className={styles.labels}>Prezime:</label>
                        <input
                            type="text"
                            name="last_name"
                            value={userToEdit && userToEdit.last_name}
                            onChange={handleInputChange}
                            className={styles.values}
                        />
                        
                    </div>
                
                )}
                <div className={styles.modalButtons}>
                <button  onClick={editUser} disabled={
                   !userToEdit || (!userToEdit.first_name && !userToEdit.last_name && !userToEdit.password && !userToEdit.confirm_password)
                  }>Save
                </button>

                <button onClick={closeEditModal}>Cancel</button>
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
                <div className={styles.user}>
                    <div className={styles.img}>
                        <Image className={styles.userImage} src="/noavatar.png" alt="" width="50" height="50" />
                    </div>
                        <div className={styles.userDetail}>
                            <div className={styles.detailItem}>
                                <p className={styles.label}>Ime:</p>
                                <p className={styles.value}>{user && user.first_name}</p>
                            </div>
                            <div className={styles.detailItem}>
                                <p className={styles.label}>Prezime:</p>
                                <p className={styles.value}>{user && user.last_name}</p>
                            </div>
                            <div className={styles.detailItem}>
                                <p className={styles.label}>Email:</p>
                                <p className={styles.value}>{user && user.email}</p>
                            </div>
                            <div className={styles.detailItem}>
                                <p className={styles.label}>Pozicija:</p>
                                <p className={styles.value}>{user && user.position}</p>
                            </div>
                            <div className={styles.detailItem}>
                                <p className={styles.label}>Uloga:</p>
                                <p className={styles.value}>{user && user.role}</p>
                            </div>
                            <div className={styles.detailItem}>
                                <p className={styles.label}>Kreirano:</p>
                                <p className={styles.value}>{user && formatDate(user.createdAt)}</p>
                            </div>
                            <button className={styles.button} onClick={() => openEditModal(user)}>Edit</button>
                
                        </div>
                </div>
                </div>
            )}
            <Modal
                isOpen={editModalIsOpen}
                onRequestClose={closeEditModal}
                className={styles.modal}
                overlayClassName={styles.overlay}
                contentLabel="Edit User Modal"
                >
                <h2 className={styles.modalTitle}>Edit User</h2>
                {userToEdit && (
                    <div className={styles.modalContent}>
                        <label htmlFor="first_name" className={styles.labels}>Ime:</label>
                        <input 
                            type="text"
                            name="first_name"
                            value={userToEdit && userToEdit.first_name}
                            onChange={handleInputChange}
                            className={styles.values}
                        />
                        <label htmlFor="last_name" className={styles.labels}>Prezime:</label>
                        <input
                            type="text"
                            name="last_name"
                            value={userToEdit && userToEdit.last_name}
                            onChange={handleInputChange}
                            className={styles.values}
                        />
                        
                    </div>
                
                )}
                <div className={styles.modalButtons}>
                <button  onClick={editUser} disabled={
                   !userToEdit || (!userToEdit.first_name && !userToEdit.last_name && !userToEdit.password && !userToEdit.confirm_password)
                  }>Save
                </button>

                <button onClick={closeEditModal}>Cancel</button>
                </div>
                </Modal> 
        </div>
      
    );
    
};
export default MySettings;