import styles from '@/app/components/equipment/equipment.module.css';
import AddEquipment from '@/app/components/addEquipment/addEquipment';

const AddEquipmentPage = () => {
    return(
        <div className={styles.container}>
            <div className={styles.container}>
                <AddEquipment/>
            </div>
        </div>
    )
}

export default AddEquipmentPage;