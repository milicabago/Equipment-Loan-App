import CreateUser from '@/app/components/createUser/createUser';
import styles from '@/app/components/createUser/createUser.module.css'

const CreateUserPage = () => {
    return (
        <div className={styles.container}>
            <div>
                <CreateUser/>
            </div>
        
        </div>
        
    );
};

export default CreateUserPage;