import Equipment from "@/app/components/equipment/equipment";
import styles from "@/app/components/equipment/equipment.module.css"

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