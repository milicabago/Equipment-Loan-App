import styles from "@/app/components/settings/settings.module.css";
import Settings from "@/app/components/settings/settings";

const SettingsPage = () => {
    return (
        <div className={styles.container}>
            <div>
                <Settings/>
            </div>
        
        </div>
        
    );
};

export default SettingsPage;