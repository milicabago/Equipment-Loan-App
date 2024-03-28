import styles from '@/app/ui/dashboard/settings/settings.module.css';
import Settings from '@/app/ui/dashboard/settings/settings';

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