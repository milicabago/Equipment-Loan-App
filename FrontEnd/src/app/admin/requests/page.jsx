import Request from "@/app/components/requests/requests";
import styles from "@/app/components/requests/requests.module.css"

const RequestPage = () => {
    return (
        <div className={styles.container}>
            <div>
                <Request/>
            </div>
            
        </div>
    );
};

export default RequestPage;