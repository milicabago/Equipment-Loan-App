"use client"
import styles from './settings.module.css';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const Settings = () => {

    const [cookies, setCookie, removeCookie] = useCookies(['accessToken']);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
      first_name: '',
        last_name: '',
        username: '',
        email: '',
        position: '',
        contact: '',
        role: ''
    });
  
    useEffect(() => {
        const token = cookies.accessToken; 
        if (token) {
          const decodedToken = jwtDecode(token); 
          if (decodedToken && decodedToken.user) {
            const userId = decodedToken.user._id;
            setUser(decodedToken.user);
          }
          let config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          axios.get (process.env.NEXT_PUBLIC_API_URL + `admin/settings`, config)
          .then ((response) => {
            setUser(response.data);
            console.log(response.data);
            setLoading(false); 
          })
          .catch ((error) => {
            console.error('Error:', error);
            setLoading(false);
          });
        }
      }, [cookies.accessToken]);


      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const token = cookies.accessToken;
      if (token) {
          let config = {
              headers: {
                  Authorization: `Bearer ${token}`,
              },
          };
          axios.post(process.env.NEXT_PUBLIC_API_URL + `admin/settings`, formData, config)
          .then((response) => {
              setUser(response.data);
              console.log('User data updated:', response.data);
          })
          .catch((error) => {
              console.error('Error:', error);
          });
      }
  };


    return (
        <div className={styles.container}>
            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                </div>
            ) : (
                <div className={styles.user}>
                    <div className={styles.img}>
                        <Image className={styles.userImage} src="/noavatar.png" alt="" width="50" height="50" />
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.userDetail}>
                            <div className={styles.firstname}>
                                <div className={styles.detailItem}>
                                    <span className={styles.label}>First Name:</span>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        className={styles.inputField}
                                        autoComplete='off'
                                    />
                                </div>
                                <div className={styles.lastname}>
                                    <span className={styles.label}>Last Name:</span>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        className={styles.inputField}
                                        autoComplete='off'
                                    />
                                </div>
                                <div className={styles.username}>
                                    <span className={styles.label}>Username:</span>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className={styles.inputField}
                                        autoComplete='off'
                                    />
                                </div>
                                <div className={styles.email}>
                                    <span className={styles.label}>Email:</span>
                                    <input
                                        type="text"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={styles.inputField}
                                        autoComplete='off'
                                    />
                                </div>
                                
                                <div className={styles.contact}>
                                    <span className={styles.label}>Contact:</span>
                                    <input
                                        type="text"
                                        name="contact"
                                        value={formData.contact}
                                        onChange={handleInputChange}
                                        className={styles.inputField}
                                        autoComplete='off'
                                    />
                                </div>
                                <div className={styles.password}>
                                    <span className={styles.label}>Password:</span>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={styles.inputField}
                                        autoComplete='off'
                                    />
                                </div>
                                <div className={styles.confirmPassword}>
                                    <span className={styles.label}>Confirm Password:</span>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className={styles.inputField}
                                        autoComplete='off'
                                    />
                                </div>
                                
                                    



                            </div>
                            <button className={styles.button} type="submit">Save Changes</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Settings;