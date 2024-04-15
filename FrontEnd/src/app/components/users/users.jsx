"use client"
import styles from './users.module.css';


const Users = () => {
  return ( 
    <div className={styles.container}>
      <div className={styles.title}>
        <h1>Korisnici</h1>
      </div>
      <div className={styles.table}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>NAME</th>
              <th>ROLE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.profile}>
                <div className={styles.photo}>
                  <img src="/noavatar.png" alt="" className={styles.photoImg} />
                </div>
                <div className={styles.details}>
                  <div className={styles.name}>Ime Prezime</div>
                  <div className={styles.email}>Email</div>
                </div>
              </td>
              <td>
                <div className={styles.role}>
                  <div className={styles.position}>CEO</div>
                  <div className={styles.profession}>(Chief Executive Officer)</div>
                </div>
              </td>
              <td>
                <div className={styles.status}>Active</div>
              </td>
              <td>
                <button className={styles.edit}>Edit</button>
                <button className={styles.delete}>Delete</button>
              </td>
            </tr>

            <tr>
              <td className={styles.profile}>
                <div className={styles.photo}>
                  <img src="/noavatar.png" alt="" className={styles.photoImg} />
                </div>
                <div className={styles.details}>
                  <div className={styles.name}>Ime Prezime</div>
                  <div className={styles.email}>Email</div>
                </div>
              </td>
              <td>
                <div className={styles.role}>
                  <div className={styles.position}>CEO</div>
                  <div className={styles.profession}>(Chief Executive Officer)</div>
                </div>
              </td>
              <td>
                <div className={styles.status}>Active</div>
              </td>
              <td>
                <button className={styles.edit}>Edit</button>
                <button className={styles.delete}>Delete</button>
              </td>
            </tr>
            
            <tr>
              <td className={styles.profile}>
                <div className={styles.photo}>
                  <img src="/noavatar.png" alt="" className={styles.photoImg} />
                </div>
                <div className={styles.details}>
                  <div className={styles.name}>Ime Prezime</div>
                  <div className={styles.email}>Email</div>
                </div>
              </td>
              <td>
                <div className={styles.role}>
                  <div className={styles.position}>CEO</div>
                  <div className={styles.profession}>(Chief Executive Officer)</div>
                </div>
              </td>
              <td>
                <div className={styles.status}>Active</div>
              </td>
              <td>
                <button className={styles.edit}>Edit</button>
                <button className={styles.delete}>Delete</button>
              </td>
            </tr>
            
            <tr>
              <td className={styles.profile}>
                <div className={styles.photo}>
                  <img src="/noavatar.png" alt="" className={styles.photoImg} />
                </div>
                <div className={styles.details}>
                  <div className={styles.name}>Ime Prezime</div>
                  <div className={styles.email}>Email</div>
                </div>
              </td>
              <td>
                <div className={styles.role}>
                  <div className={styles.position}>CEO</div>
                  <div className={styles.profession}>(Chief Executive Officer)</div>
                </div>
              </td>
              <td>
                <div className={styles.status}>Active</div>
              </td>
              <td>
                <button className={styles.edit}>Edit</button>
                <button className={styles.delete}>Delete</button>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
