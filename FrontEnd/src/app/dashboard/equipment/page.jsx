import styles from '@/app/ui/dashboard/equipment/equipment.module.css';
import Equipment from '@/app/ui/dashboard/equipment/equipment';

const EquipmentPage = () => {
    return (
        <div className={styles.container}>
            <div>
                <Equipment/>
            </div>
            
        </div>

    );
};

export default EquipmentPage;