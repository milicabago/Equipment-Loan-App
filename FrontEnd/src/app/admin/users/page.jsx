import styles from "@/app/components/users/users.module.css";
import Users from "@/app/components/users/users";

const UsersPage = () => {
    return (
        <div className={styles.container}>
            <div>
                <Users/>
            </div>
        
        </div>
        
    );
};

export default UsersPage;