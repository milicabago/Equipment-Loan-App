import styles from "@/app/ui/dashboard/users/users.module.css";
import Users from "@/app/ui/dashboard/users/users";

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