import EquipmentHistory from "@/app/components/equipmentHistory/equipmentHistory";
import styles from "@/app/components/equipmentHistory/equipmentHistory.module.css"

const EquipmentHistoryPage = () => {
    return (
        <div className={styles.container}>
            <div>
                <EquipmentHistory/>
            </div>
            
        </div>
    );
};

export default EquipmentHistoryPage;