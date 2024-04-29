"use client"
import styles from './mySettings.module.css';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import toast from 'react-hot-toast';

const Settings = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['accessToken']);
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [editUser, setEditUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const formatDate = (dateTimeString) => {
        const date = new Date(dateTimeString);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString();
        return `${formattedDate} ${formattedTime}`;
    };

    useEffect(() => {
        const token = cookies.accessToken;
        axios.get(process.env.NEXT_PUBLIC_BASE_URL + "user/settings", {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then((response) => {
            setUser(response.data);
            setEditUser(response.data);
            setLoading(false);
            console.log("User:", response.data);
        })
        .catch((error) => {
            console.error("Error:", error);
            setLoading(false);
        });
    }, [cookies.accessToken]);

      const handleEdit = (field, value) => {
    
        if (field === 'contact' && isNaN(value)) {
            return; 
        }
        setEditUser({...editUser, [field]: value});
    };


    const handleSave = async () => {
        try{
            const token = cookies.accessToken;
            const userId = localStorage.getItem('userId');
            console.log("UserId:", userId);
            if(!userId) {
                console.log("userId not found in localStorage");
                return;
            }
            const response = await axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}user/settings/${userId}`, {
                first_name: editUser.first_name,
                last_name: editUser.last_name,
                email: editUser.email,
                username: editUser.username,
                contact: editUser.contact,
                
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            toast.success('User has been successfully updated.', { duration: 3000 });
        } catch (error) {
            if (error.response && error.response.data) {
                toast.error(error.response.data.message, { duration: 3000 });
            } else {
                toast.error('Failed to update user!', { duration: 3000 });
            }
            
        }
    }
    

   
   
    

    return (
        <div className={styles.container}>
             
            
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
                                <p className={styles.label}>First name:</p>
                                <input className={styles.value} value={editUser && editUser.first_name} onChange={(e) => handleEdit('first_name', e.target.value)} />
                            </div>
                            <div className={styles.detailItem}>
                                <p className={styles.label}>Last name:</p>
                                <input className={styles.value} value={editUser && editUser.last_name} onChange={(e) => handleEdit('last_name', e.target.value)} />
                            </div>
                            <div className={styles.detailItem}>
                                <p className={styles.label}>Email:</p>
                                <input className={styles.value} value={editUser && editUser.email} onChange={(e) => handleEdit('email', e.target.value)} />
                            </div>
                            <div className={styles.detailItem}>
                                <p className={styles.label}>Contact:</p>
                                <input className={styles.value} value={editUser && editUser.contact} onChange={(e) => handleEdit('contact', e.target.value)} />
                            </div>

                            <div className={styles.detailItem}>
                                <p className={styles.label}>Username:</p>
                                <input className={styles.value} value={editUser && editUser.username} onChange={(e) => handleEdit('username', e.target.value)} />
                            </div>

                            <div className={styles.detailItem}>
                                <p className={styles.label}>Position:</p>
                                <p className={styles.value}>{user && user.position}</p>
                            </div>
                            <div className={styles.detailItem}>
                                <p className={styles.label}>Role:</p>
                                <p className={styles.value}>{user && user.role}</p>
                            </div>
                            <div className={styles.detailItem}>
                                <p className={styles.label}>Created:</p>
                                <p className={styles.value}>{user && formatDate(user.createdAt)}</p>
                            </div>
                            <div className={styles.detailItem}>
                                <p className={styles.label}>Ažurirano:</p>
                                <p className={styles.value}>{user && formatDate(user.updatedAt)}</p>
                            </div>
                            <button className={styles.button} onClick={handleSave} disabled={JSON.stringify(user) === JSON.stringify(editUser)}>Save</button>
                        
                        </div>
                </div>
                </div>
            )}
            
        </div>
      
    );
    
};
export default Settings;