"use client"
import React, { useState, useEffect } from 'react';
import styles from '@/app/components/sidebar/sidebar.module.css';
import MenuLink from './menuLink/menuLink';
import Image from 'next/image';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useLogout } from '@/app/auth/logout/logout';
import {
    MdDashboard,
    MdSupervisedUserCircle,
    MdOutlineSettings,
    MdLogout,
    MdHistory,
    MdAssignmentReturn,
    MdStorage,
    MdPlaylistAdd,
    MdPersonAdd
} from 'react-icons/md';




const menuItems = [
  
    {
      title: "Display",
      list: [
        {
          title: "Dashboard",
          path: "/admin",
          icon: <MdDashboard />,
        },
        {
          title: "Requests",
          path: "/admin/requests",
          icon: <MdAssignmentReturn />,
        },
        {
          title: "Users",
          path: "/admin/users",
          icon: <MdSupervisedUserCircle />,
        },
        {
          title: "Equipment",
          path: "/admin/equipment",
          icon: <MdStorage />,
        },
        
        
      ],
    },
    
    {
      title: "Management",
      list: [
        {
          title: "Create User",
          path: "/admin/createUser",
          icon: <MdPersonAdd />,
        },
        {
          title: "Add Equipment",
          path: "/admin/addEquipment",
          icon: <MdPlaylistAdd />,
        },
        {
          title: "History",
          path: "/admin/history",
          icon: <MdHistory />,
        },
        
        
      ],
    },


    {
      title: "Account",
      list: [
        {
          title: "Settings",
          path: "/admin/settings",
          icon: <MdOutlineSettings />,
        },
       
      ],
    },
    

  ];

const Sidebar = () => {

  const [cookies, setCookie, removeCookie] = useCookies(['accessToken']);
  const [userData, setUserData] = useState();
  const [role, setRole] = useState(null);
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [id, setId] = useState('');
  const router = useRouter();
  const { handleLogout } = useLogout(); 

 
  useEffect(() => {
    const token = cookies.accessToken;
    
    if (token) {
        const decodedToken = jwtDecode(token);
        const id = decodedToken.user._id;
        const userRole = decodedToken.user.role;
        const userFirstName = decodedToken.user.first_name;
        const userLastName = decodedToken.user.last_name;
        const expirationTime = decodedToken.exp * 1000;
        const currentTime = Date.now();

        if (expirationTime < currentTime) {
          handleLogout();
        } else {
            setRole(userRole === 'admin' ? 'Administrator' : '');
            setFirstName(userFirstName);
            setLastName(userLastName);

            if (userRole !== 'admin') {
              clearHistoryAndRedirect();
              toast.error('You are not authorized to access this page');
              return;
            }
        }
    } else {
      handleLogout();
        setFirstName(null);
        setLastName(null);
        setRole(null);
    }
}, [cookies.accessToken]);


  

  const clearHistoryAndRedirect = () => {
    router.replace('/auth/login');
  };


  useEffect(() => {
    const token = cookies.accessToken;
    if (token) {
        const decodedToken = jwtDecode(token);
        const expirationTime = decodedToken.exp * 1000;
        const currentTime = Date.now();
        if (expirationTime < currentTime) {
          handleLogout();
        }
    }
  }, [cookies.accessToken, handleLogout]);



    return(
        <div className={styles.container}>
          <div className={styles.user}>
            <Image className={styles.userImage} src="/user.png" alt="" width="50" height="50" />
            <div className={styles.userDetail}>
              <div className={styles.username}>
              <span className={styles.firstname}>{firstName}</span>{' '}
              <span className={styles.lastname}>{lastName}</span>
              </div>
              <span className={styles.userRole}>{role}</span>
            </div>
          </div>


            <ul className={styles.list}>
                {menuItems.map(cat=>(
                    <li key={cat.title}>
                        <span className={styles.cat}>{cat.title}</span>
                        {cat.list.map(item => (
                          <MenuLink item={item} key={item.title} />
                        ))}
                    </li>
                ))}
            </ul>
            <button className={styles.logout} onClick={handleLogout}>
              <MdLogout/>
              Logout</button>

        </div>
    )
}

export default Sidebar;