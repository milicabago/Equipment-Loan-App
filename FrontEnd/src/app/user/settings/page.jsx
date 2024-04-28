import styles from "@/app/components/mySettings/mySettings.module.css";
import MySettings from "@/app/components/mySettings/mySettings";

const SettingsPage = () => {
    return (
        <div className={styles.container}>
            <div>
                <MySettings/>
            </div>
        
        </div>
        
    );
};

export default SettingsPage;