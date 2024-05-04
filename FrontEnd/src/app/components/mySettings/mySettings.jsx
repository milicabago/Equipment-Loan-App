"use client"
import styles from './mySettings.module.css';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import { useRouter } from 'next/navigation';

const schema = yup.object().shape({
    first_name: yup.string().notRequired("First name is not required!").matches(/^(\S+\s)*\S+$/, '\"First name\" cannot start or end with spaces, or contain multiple consecutive spaces!'),
    last_name: yup.string().notRequired("Last name is not required!").matches(/^(\S+\s)*\S+$/, '\"Last name\" cannot start or end with spaces, or contain multiple consecutive spaces!'),
    email: yup.string().email().notRequired("Email is not required!"),
    username: yup.string().notRequired("Username is not required!").matches(/^[a-zA-Z0-9]{3,30}$/, '\"Username\" must be alphanumeric and have a length between 3 and 30 characters!'),
    role: yup.string().notRequired(), 
    contact: yup.string().matches(/^(\S+\s)*\S+$/, '\"Contact\" cannot start or end with spaces, or contain multiple consecutive spaces!').notRequired(), 
    position: yup.string().notRequired(), 
    password: yup.string().min(8, "Password must be at least 8 characters long").notRequired(), 
    confirm_password: yup.string().when('password', {
        is: (val) => (val && val.length > 0), 
        then: yup.string().oneOf([yup.ref("password"), null], "Passwords don't match").required("Please confirm your password"),
        otherwise: yup.string().notRequired()
    }), 
});

const Settings = () => {
    const [cookies, removeCookie] = useCookies(['accessToken']);
    const [firstName, setFirstName] = useState(null);
    const [lastName, setLastName] = useState(null);
    const [role, setRole] = useState(null);
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [editUser, setEditUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [passwordChanged, setPasswordChanged] = useState(false);
    const [passwordEntered, setPasswordEntered] = useState(false);
    const router = useRouter();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

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
            setUserId(response.data._id);
            setLoading(false);
            console.log("User:", response.data);
        })
        .catch((error) => {
            console.error("Error:", error);
            setLoading(false);
        });
    }, [cookies.accessToken]);


      const handleEdit = (field, value) => {
    
        if (field === 'contact' && !/^\+?\d*$/.test(value)) {
            return; 
        }
        if (field === 'password') {
            setPasswordEntered(value !== "" && value !== editUser.password); 
        }
    
        setEditUser({...editUser, [field]: value});
        
    };
    useEffect(() => {
        setPasswordChanged(passwordEntered && editUser?.password !== user?.password);
    }, [passwordEntered, editUser?.password, user?.password]);

    const handleSave = async () => {
        
        try {
            
            let token = document.cookie
              .split('; ')
              .find(row => row.startsWith('accessToken'))
              .split('=')[1];
            const { first_name, last_name, email, contact, username, password, confirm_password } = editUser;
            const isPasswordChanged = passwordEntered && (password !== user.password);
            setPasswordChanged(isPasswordChanged); 

            if (isPasswordChanged && (!password || !confirm_password)) {
                toast.error("Please confirm password.");
                return;
            }
            if (isPasswordChanged && password !== confirm_password) {
                toast.error("Passwords do not match. Please make sure both passwords match.");
                return;
            }

            const editedUserData = {
                first_name,
                last_name,
                email,
                contact,
                username,
                password
            };
    
            const response = await axios.put(process.env.NEXT_PUBLIC_BASE_URL + `user/settings/${userId}`, editedUserData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                if (passwordChanged) {
                    toast.success("Profile updated successfully.", { duration: 3000 });
                    setTimeout(() => {
                        toast.success("Password has been changed. Please log in again.", { duration: 3000 });
                    }, 2000);
                    setTimeout(() => {
                        handleLogout();
                    }, 5000);
                    
                } else {
                    toast.success("Profile updated successfully." , { duration: 2000 });
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
                setUser(response.data.updatedUser);
                
            } else {
                toast.error("Failed to update profile.");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile. Please try again later.");
        }
    };
   
    const handleLogout = () => {
        setFirstName(null);
        setLastName(null);
        setRole(null);
        removeCookie('accessToken');
        localStorage.removeItem('user._id');
        clearHistoryAndRedirect();
        
      };
      
      const clearHistoryAndRedirect = () => {
        router.replace('/auth/login');
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
                                <p className={styles.label}>Updated:</p>
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

