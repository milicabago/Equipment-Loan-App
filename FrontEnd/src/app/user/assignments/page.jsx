import Assignments from "@/app/components/assignments/assignments";
import styles from "@/app/components/assignments/assignments.module.css"

const AssignmentsPage = () => {
    return (
        <div className={styles.container}>
            <div>
                <Assignments/>
            </div>
            
        </div>
    );
};

export default AssignmentsPage;