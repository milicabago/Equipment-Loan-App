"use client"
import styles from './requests.module.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import Modal from 'react-modal';

const Request = () => {
    const [requests, setRequests] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [cookies, setCookie, removeCookie] = useCookies(['accessToken']);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = cookies.accessToken;
        if (token) {
            const decodedToken = jwtDecode(token);
            let config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
            if (decodedToken.user.role.includes('admin') ) {
                console.log("uspjeh", decodedToken.user.role)
                setIsAdmin(true);
                axios.get(process.env.NEXT_PUBLIC_BASE_URL + "admin/requests", config)
                .then((response) => {
                  setRequests(response.data);
                  console.log("Requests:", response.data);
                  setLoading(false);
                })
                .catch((error) => {
                  console.error("Error:", error);
                  setLoading(false);
                });
              }
            }
          }, [cookies.accessToken]);



    return (
        <div className={styles.container}>
            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                </div>
            ) : (
                <div>
                    <h2>All Requests</h2>
                    {requests.length > 0 ? (
                        <div className={styles.cardsContainer}>
                            {requests.map((request, index) => (
                                <div key={index} className={styles.card}>
                                    <h3>User: {request.user_info ? `${request.user_info.first_name} ${request.user_info.last_name}` : 'Unknown'}</h3>
                                    <p>Equipment: {request.equipment_info ? request.equipment_info.name : 'Unknown'}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No requests found.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default Request;


