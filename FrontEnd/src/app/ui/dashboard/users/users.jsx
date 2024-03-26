import { MdSupervisedUserCircle } from 'react-icons/md';
import styles from './users.module.css';

const Users = () => {
    return (
        <div className={styles.container}>
            {/*<MdSupervisedUserCircle size={24} />*/}

            <div className={styles.form}> 
                <form action="" className={styles.form}>
                    <div className={styles.start}>
                        <span className={styles.title}>Osobni podaci korisnika</span>
                        <span className={styles.desc}> </span> 
                    </div>

                    <label className={styles.name}>Ime:
                    <input type="text" placeholder="Unesite ime" /></label>
                    <label className={styles.surname}>Prezime:
                    <input type="text" placeholder="Unesite prezime" /></label>
                    <label className={styles.username}>Korisničko ime:
                    <input type="text" placeholder="Unesite korisničko ime" /></label>
                    <label className={styles.email}>Email adresa:
                    <input type="email" placeholder="Unesite email"/></label>
                    
                    <label className={styles.password}>Lozinka:
                    <input type="password" placeholder="******"/></label>
                    <label className={styles.contact}>Kontakt:
                    <input type="text" placeholder="Unesite kontakt broj"/></label> 
                    <label className={styles.role}>Uloga:
                    
                        <select className={styles.select}>
                            <option  className={styles.admin} value="1">Administrator</option>
                            <option className={styles.employee} value="2">Uposlenik</option>
                        </select>
                    </label>
                    <div >
                    <button className={styles.button} type="submit">Kreiraj</button>
                    </div>
                </form>

            </div>            
        </div>
    );
};

export default Users;