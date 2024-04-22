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
              <div className={styles.userDetail}>
              {user && (
                <div>
                <span className={styles.firstname}>{user.first_name}</span>{' '}
                <span className={styles.lastname}>{user.last_name}</span>
                <span className={styles.username}>{user.username}</span>
                <span className={styles.email}>{user.email}</span>
                <span className={styles.contact}>{user.contact}</span>
                <span className={styles.userRole}>{user.role}</span>
                </div> 
                
                )}
                </div>
          
          </div>
            
             )}
            
             </div>
    )
}

export default Settings; 