import MyEquipment from "@/app/components/myEquipment/myEquipment";
import styles from "@/app/components/myEquipment/myEquipment.module.css"

const EquipmentPage = () => {
    return (
        <div className={styles.container}>
            <div>
                <MyEquipment/>
            </div>
            
        </div>
    );
};

export default EquipmentPage;