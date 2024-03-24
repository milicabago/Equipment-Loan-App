import styles from './sidebar.module.css';
import MenuLink from './menuLink/menuLink';
import Image from 'next/image';

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
          path: "/dashboard",
          icon: <MdDashboard />,
        },
        {
          title: "Zahtjevi",
          path: "/dashboard/requests",
          icon: <MdShoppingBag />,
        },
        
        
      ],
    },
    
    {
      title: "Upravljanje",
      list: [
        {
          title: "Kreiraj korisnika",
          path: "/dashboard/users",
          icon: <MdSupervisedUserCircle />,
        },
        {
          title: "Dodaj opremu",
          path: "/dashboard/equipment",
          icon: <MdEditDocument />,
        },
        
        
      ],
    },


    {
      title: "Račun",
      list: [
        {
          title: "Postavke",
          path: "/dashboard/settings",
          icon: <MdOutlineSettings />,
        },
       
      ],
    },

  ];

const Sidebar = () => {
    return(
        <div className={styles.container}>
          <div className={styles.user}>
            <Image className={styles.userImage} src="/noavatar.png" alt="" width="50" height="50" />
            <div className={styles.userDetail}>
              <span className={styles.username}>Milica Bago</span>
              <span className={styles.userTitle} >Administrator</span>
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
            <button className={styles.logout}>
              <MdLogout/>
              Odjava</button>

        </div>
    )
}

export default Sidebar;
