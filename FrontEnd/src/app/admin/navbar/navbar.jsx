"use client";
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import styles from '@/app/components/navbar/navbar.module.css';
import { MdNotifications, MdDelete } from 'react-icons/md'; 
import { useCookies } from 'react-cookie';
import { useLogout } from '@/app/auth/logout/logout';


const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [cookies, setCookie] = useCookies(['accessToken']);
    const [socket, setSocket] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const { handleLogout } = useLogout(); 



    useEffect(() => {
        const token = cookies.accessToken;
        const userId = localStorage.getItem('userId');

        if (!userId || !token) return;

        // Initialize socket connection only once
        const newSocket = io('http://localhost:5001', { query: { user_id: userId } });
        setSocket(newSocket);

        newSocket.on('adminUpdateUserOrAdminProfile', (notification) => {
            setNotifications((prev) => [...prev, notification]);
            setUnreadCount((prev) => prev + 1);

            const changes = notification.message.split('\n').filter(change => change.includes('changed'));

            changes.forEach(change => {
                if (change.includes("ROLE changed")) {
                    toast.success("ROLE changed to ADMIN.\n Logout in 10 seconds!", { duration: 9000 });
                    setTimeout(() => {
                        handleLogout();
                        handleDeleteNotification(notification._id);
                    }, 10000);
                } else if (change.includes("USERNAME changed")) {
                    toast.success("USERNAME changed.\n", { duration: 9000 });
                } else if (change.includes("POSITION changed")) {
                    toast.success("POSITION changed.\n", { duration: 9000 });
                }
            });
        });

        // Add new event listener for unassignRequest
        newSocket.on('unassignRequest', (notification) => {
            setNotifications((prev) => [...prev, notification]);
            setUnreadCount((prev) => prev + 1);
            toast.success(notification.message, { duration: 5000 });
        });

        // Add new event listener for cancelOrUpdateRequest
        newSocket.on('cancelOrUpdateRequest', (notification) => {
            setNotifications((prev) => [...prev, notification]);
            setUnreadCount((prev) => prev + 1);
            toast.success(notification.message, { duration: 5000 });
        });

        newSocket.on('newAssignmentRequest', (notification) => {
            setNotifications((prev) => [...prev, notification]);
            setUnreadCount((prev) => prev + 1);
            toast.success("New equipment assignment request received.", { duration: 5000 });
        });

        // Fetch existing notifications
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}allNotifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                console.log('Fetched notifications:', response.data); // Debug log
                if (Array.isArray(response.data)) {
                    const filteredNotifications = response.data.filter(notification => notification.sender === 'admin' || notification.sender === 'user');
                    setNotifications(filteredNotifications);
                    const unreadNotifications = filteredNotifications.filter(notification => !notification.read);
                    setUnreadCount(unreadNotifications.length);
                } else {
                    console.error('Error: Expected an array of notifications');
                }
            })
            .catch(error => console.error('Error fetching notifications:', error));

        // Clean up socket connection on component unmount
        return () => {
            newSocket.close();
        };
    }, [cookies.accessToken]);

    const handleDeleteNotification = (id) => {
        const token = cookies.accessToken;
        let config = {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        };

        axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}notifications/${id}`, config)
            .then(response => {
                if (response.data.message === 'Notification DELETED.') {
                    setNotifications((prev) => prev.filter(notification => notification._id !== id));
                    setUnreadCount((prev) => prev - 1);
                } else {
                    console.error('Error deleting notification:', response.data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                toast.error(error.response.data.message, { duration: 3000 });
            });
    };

    const markNotificationsAsRead = async () => {
        try {
            const token = cookies.accessToken;

            for (const notification of notifications) {
                if (!notification.read) {
                    await axios.patch(
                        `${process.env.NEXT_PUBLIC_BASE_URL}notifications/${notification._id}/read`,
                        { read: true },
                        {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                }
            }

            setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    const toggleNotifications = () => {
        const newShowNotifications = !showNotifications;
        setShowNotifications(newShowNotifications);
        if (newShowNotifications) {
            setUnreadCount(0); // Reset unread count when notifications are opened
            markNotificationsAsRead(); // Mark all notifications as read
        }
    };





  
    

    const handleDeleteAllNotifications = () => {
        const token = cookies.accessToken;
        let config = {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        };

        axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}notifications`, config)
            .then(response => {
                if (response.data.message === 'All notifications DELETED.') {
                    setNotifications([]);
                    setUnreadCount(0);
                } else {
                    console.error('Error deleting all notifications:', response.data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    

    

    const handleNotificationAction = (id, e) => {
        e.stopPropagation();
        handleDeleteNotification(id);
    };

    const hasUnreadNotifications = notifications.some(notification => !notification.read);
    const noNotificationsMessage = "No new notifications.";

    return (
         <div className={styles.container}>
            <div className={styles.title}>Equipment Loan Manager</div>
            <div className={styles.menu}></div>

            <div className={styles.notifications} onClick={toggleNotifications}>
                <MdNotifications size={30} />
                {hasUnreadNotifications && (
                    <div className={styles.unreadCount}>{unreadCount}</div>
                )}
            </div>
            {showNotifications && (
                <div className={styles.dropdownMenu}>
                    {notifications.length > 0 ? (
                        <>
                            {notifications.map(notification => (
                                <div key={notification._id} 
                                className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                                >
                                    <p>{notification.message}</p>
                                    <button
                                        className={styles.deleteButton}
                                        onClick={(e) => handleNotificationAction(notification._id, e)}
                                    >
                                        <MdDelete />
                                    </button>
                                </div>
                            ))}
                            <button
                                className={styles.deleteAllButton}
                                onClick={handleDeleteAllNotifications}
                            >
                                Clear notifications
                            </button>
                        </>
                    ) : (
                        <p>{noNotificationsMessage}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Navbar;
