import Request from "@/app/ui/dashboard/requests/requests";
import styles from "@/app/ui/dashboard/requests/requests.module.css"

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