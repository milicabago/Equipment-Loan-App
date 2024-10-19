"use client"
import styles from  '@/app/components/settings/page.module.css';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import { useLogout } from '@/app/auth/logout/logout';

const SettingsPage = () => {
    const [cookies] = useCookies(['accessToken']);
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [editUser, setEditUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [emailChanged, setEmailChanged] = useState(false);
    const [emailEntered, setEmailEntered] = useState(false);
    const [passwordChanged, setPasswordChanged] = useState(false);
    const [passwordEntered, setPasswordEntered] = useState(false);
    const { handleLogout } = useLogout(); 

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const formatDate = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return `${date.toLocaleDateString('hr-HR')} ${date.toLocaleTimeString('hr-HR')}`;
    };

    const fetchUserData = useCallback(() => {
        const token = cookies.accessToken;
        axios.get(process.env.NEXT_PUBLIC_BASE_URL + "admin/settings", {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then((response) => {
            setUser(response.data);
            setEditUser(response.data);
            setUserId(response.data._id);
            setLoading(false);
            console.log("User:", response.data);
        })
        .catch((error) => {
            console.error("Error:", error);
            setLoading(false);
        });
    }, [cookies.accessToken]);
    
    useEffect(() => {
        fetchUserData(); 
    }, [cookies.accessToken, fetchUserData]);

    

    const handleEdit = (field, value) => {
        if (field === 'contact' && !/^\+?\d*$/.test(value)) {
            return;
        }
        if (field === 'password') {
            setPasswordEntered(value !== "" && value !== editUser.password);
        }
        if (field === 'email') {
            setEmailEntered(value !== "" && value !== editUser.email);
        }
        setEditUser({...editUser, [field]: value});
    };

    useEffect(() => {
        setPasswordChanged(passwordEntered && editUser?.password !== user?.password);
        setEmailChanged(emailEntered && editUser?.email!== user?.email);
    }, [passwordEntered, editUser?.password, user?.password, emailEntered, editUser?.email, user?.email]);


    const handleSave = async () => {
        try {
            let token = document.cookie
                .split('; ')
                .find(row => row.startsWith('accessToken'))
                .split('=')[1];
            const { first_name, last_name, email, contact, username, password, position, confirm_password } = editUser;
            const isPasswordChanged = passwordEntered && (password !== user.password);
            setPasswordChanged(isPasswordChanged);
            
            const isEmailChanged = emailEntered && (email !== user.email);
            setEmailChanged(isEmailChanged);
    
            if (isPasswordChanged && (!password || !confirm_password)) {
                toast.error("Please confirm password.");
                return;
            }
            if (isPasswordChanged && password !== confirm_password) {
                toast.error("Passwords do not match. Please make sure both passwords match.");
                return;
            }
            if (isPasswordChanged && password === user.password) {
                toast.error(error.response.data.message); 
                return;
            }
            const editedUserData = {
                first_name,
                last_name,
                email,
                contact,
                username,
                position
            };
            if (isPasswordChanged) {
                editedUserData.password = password;
            }
            const response = await axios.put(process.env.NEXT_PUBLIC_BASE_URL + `admin/settings/${userId}`, editedUserData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                toast.success("Profile updated successfully.", { duration: 3000 }); 
                setUser(response.data.updatedUser); 

                if (isPasswordChanged && isEmailChanged) {
                    setTimeout(() => {
                        toast('Password and email have been changed!', {
                            icon: '⚠️ ',
                            duration: 3000
                        });
                    }, 2000);  
                } else if (isPasswordChanged) {
                    setTimeout(() => {
                        toast('Password has been changed!', {
                            icon: '⚠️ ',
                            duration: 3000
                        });
                    }, 2000); 
                } else if (isEmailChanged) {
                    setTimeout(() => {
                        toast('Email has been changed!', {
                            icon: '⚠️ ',
                            duration: 3000
                        });
                    }, 2000);
                }
                if (isPasswordChanged || isEmailChanged) {
                    setTimeout(() => {
                        toast('Logging out in 5 seconds...', {
                            icon: '🔄 ',
                            duration: 3000
                        });
                    }, 4000);            
                    setTimeout(() => {
                        handleLogout();
                    }, 6000);
                } else {
                    fetchUserData();
                }
            } else {
                toast.error("Failed to update profile.");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error.response.data.message , { duration: 3000 });
        }
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
                            <h1>Settings</h1>
                            </div>
                    <div className={styles.user}>
                        <div className={styles.img}>
                            <Image className={styles.userImage} src="/user.png" alt="" width="50" height="50" />
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
                                <p className={styles.label}>Password:</p>
                                <input
                                    className={styles.value}
                                    type={showPassword ? "text" : "password"}
                                    value={editUser && editUser.new_password}
                                    onChange={(e) => handleEdit('password', e.target.value)}
                                />
                                <span className={`${styles.passwordToggle} ${showPassword ? styles.show : ''}`} onClick={togglePasswordVisibility}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                            <div className={styles.detailItem}>
                                <p className={styles.label}>Confirm:</p>
                                <input
                                    className={styles.value}
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={editUser && editUser.confirm_password}
                                    onChange={(e) => handleEdit('confirm_password', e.target.value)}
                                    disabled={!passwordEntered}
                                />
                                <span className={`${styles.passwordToggle} ${showConfirmPassword ? styles.show : ''}`} onClick={toggleConfirmPasswordVisibility}>
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                            <div className={styles.detailItem}>
                                <p>
                                    <span className={styles.label}>Position: </span>
                                    <span>
                                    <select
                                        name="position"
                                        value={editUser && editUser.position}
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
                                <p className={styles.label}>Role:</p>
                                <p className={styles.value}>{user && user.role}</p>
                            </div>
                            <div className={styles.detailItem}>
                                <p className={styles.label}>Created:</p>
                                <p className={styles.value}>{user && formatDate(user.createdAt)}</p>
                            </div>
                            <div className={styles.detailItem}>
                                <p className={styles.label}>Updated:</p>
                                <p className={styles.value}>{user && formatDate(user.updatedAt)}</p>
                            </div>
                            <button 
                                className={styles.button} 
                                onClick={handleSave} 
                                disabled={
                                    !editUser?.first_name || 
                                    !editUser?.last_name || 
                                    !editUser?.username || 
                                    JSON.stringify(user) === JSON.stringify(editUser)
                                }
                            >
                                Save
                            </button>                        
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default SettingsPage;