"use client"
import React, { useState, useEffect } from 'react';
import styles from './sidebar.module.css';
import MenuLink from './menuLink/menuLink';
import Image from 'next/image';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';



import {
    MdDashboard,
    MdSupervisedUserCircle,
    MdShoppingBag,
    MdOutlineSettings,
    MdLogout,
    MdEditDocument
} from 'react-icons/md';


const menuItems = [
  
    {
      title: "Prikaz",
      list: [
        {
          title: "Nadzorna ploča",
          path: "/admin",
          icon: <MdDashboard />,
        },
        {
          title: "Zahtjevi",
          path: "/admin/requests",
          icon: <MdShoppingBag />,
        },
        {
          title: "Korisnici",
          path: "/admin/users",
          icon: <MdSupervisedUserCircle />,
        },
        {
          title: "Oprema",
          path: "/admin/equipment",
          icon: <MdShoppingBag />,
        },
        
        
      ],
    },
    
    {
      title: "Upravljanje",
      list: [
        {
          title: "Kreiraj korisnika",
          path: "/admin/createUser",
          icon: <MdSupervisedUserCircle />,
        },
        {
          title: "Dodaj opremu",
          path: "/admin/addEquipment",
          icon: <MdEditDocument />,
        },
        
        
      ],
    },


    {
      title: "Račun",
      list: [
        {
          title: "Postavke",
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

 
  useEffect(() => {
    const token = cookies.accessToken; 
    if (token) {
      const decodedToken = jwtDecode(token); 
      const id = decodedToken.user._id;
      const userRole = decodedToken.user.role; 
      const userFirstName = decodedToken.user.first_name; 
      const userLastName = decodedToken.user.last_name;
      setRole(userRole === 'admin' ? 'Administrator' : ''); 
      setFirstName(userFirstName); 
      setLastName(userLastName);
      setId(id); 
    } else {
      setRole(null); 
      setFirstName(''); 
      setLastName('');
      setId(''); 
    }
  }, [cookies.accessToken]);


  const handleLogout = () => {
    removeCookie('accessToken');
    localStorage.removeItem('accessToken');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  const clearHistory = () => {
    window.history.pushState(null, '', window.location.href);
    window.history.forward();
};

  };

    return(
        <div className={styles.container}>
          <div className={styles.user}>
            <Image className={styles.userImage} src="/noavatar.png" alt="" width="50" height="50" />
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
              Odjava</button>

        </div>
    )
}

export default Sidebar;