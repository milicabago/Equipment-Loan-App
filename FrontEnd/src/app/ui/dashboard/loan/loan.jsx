import styles from './loan.module.css';
import Image from 'next/image';

const Loan = () => {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Latest Loan</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Equipment</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <Image src="/noavatar.png" alt="" width={40} height={40} 
                            className={styles.userImage} /> 
                            Milica Bago
                        </td>

                        <td className={`${styles.status} ${styles.pending}`}>Pending</td>
                        <td>20.03.2024.</td>
                        <td>Laptop</td>
                    </tr>
                </tbody>
            </table>






        </div>
    );
};

export default Loan;