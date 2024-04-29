"use client"
import styles from './settings.module.css';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import Modal from 'react-modal';
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
        let config = {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        }
        axios.get(process.env.NEXT_PUBLIC_BASE_URL + "admin/settings", config)
          .then((response) => {
            setUser(response.data);
            setEditUser(response.data);
            setLoading(false);
            console.log("Users:", response.data);
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

    const handleSave = async (data) => {
        try{
            const token = cookies.accessToken;
            const userId = user.id;
            
            const response = await axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}admin/settings`, {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                username: data.username,
                contact: data.contact,
                
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
                                <p className={styles.value}>{user && user.first_name}</p>
                            </div>
                            <div className={styles.detailItem}>
                                <p className={styles.label}>Last name:</p>
                                <p className={styles.value}>{user && user.last_name}</p>
                            </div>
                            <div className={styles.detailItem}>
                                <p className={styles.label}>Email:</p>
                                <input className={styles.value} value={editUser && editUser.email} onChange={(e) => handleEdit('email', e.target.value)} />
                            </div>
                            <div className={styles.detailItem}>
                                <p className={styles.label}>Contact:</p>
                                <p className={styles.value}>{user && user.contact}</p>
                            </div>

                            <div className={styles.detailItem}>
                                <p className={styles.label}>Username:</p>
                                <input className={styles.value} value={editUser && editUser.username} onChange={(e) => handleEdit('username', e.target.value)} />
                            </div>
                            <div className={styles.detailItem}>
                            <p>
                                <span className={styles.label}>Role: </span>
                                <span>
                                <select
                                    name="role"
                                    value={editUser.role || editUser.role}
                                    onChange={(e) => handleEdit('role', e.target.value)}
                                    className={styles.value}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="user">User</option>
                                </select>
                                </span>
                            </p>
                            </div>
                            <div className={styles.detailItem}>
                            <p>
                                <span className={styles.label}>Position: </span>
                                <span>
                                <select
                                    name="position"
                                    value={editUser.position || editUser.position}
                                    onChange={(e) => handleEdit('position', e.target.value)}
                                    className={styles.value}
                                >
                                    <option value="Project manager">Project manager</option>
                                    <option value="Software developer">Software developer</option>
                                    <option value="Graphic designer">Graphic designer</option>
                                    <option value="Financial accountant">Financial accountant</option>
                                    <option value="DevOps Engineer">DevOps Engineer</option>
                                    <option value="Junior Product Owner">Junior Product Owner</option>
                                </select>
                                </span>
                            </p>
                            </div>
    
                            <div className={styles.detailItem}>
                                <p className={styles.label}>Created:</p>
                                <p className={styles.value}>{user && formatDate(user.createdAt)}</p>
                            </div>
                            <div className={styles.detailItem}>
                                <p className={styles.label}>Ažurirano:</p>
                                <p className={styles.value}>{user && formatDate(user.updatedAt)}</p>
                            </div>
<button className={styles.button} onClick={handleSave} disabled={JSON.stringify(user) === JSON.stringify(editUser)}>Save</button>                        </div>
                </div>
                </div>
            )}
            
        </div>
      
    );
    
};
export default Settings;