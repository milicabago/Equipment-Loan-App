import styles from './equipment.module.css'

const Equipment = () => {
    return(
        <div className={styles.container}>
            {/*<MdSupervisedUserCircle size={24} />*/}

            <div className={styles.form}> 
                <form action="" className={styles.form}>
                    <div className={styles.start}>
                        <span className={styles.title}>Podaci o opremi</span>
                        <span className={styles.desc}> </span> 
                    </div>

                    <label className={styles.name}>Oprema:
                    <input type="text" placeholder="Unesite naziv opreme" /></label>
                    <label className={styles.model}>Naziv modela pripadajuće opreme:
                    <input type="text" placeholder="Unesite naziv modela" /></label>
                    <label className={styles.number}>Serijski broj:
                    <input type="text" placeholder="Unesite serijski broj" /></label>


                    
                    <label className={styles.role}>Stanje opreme:
                    
                        <select className={styles.select}>
                            <option  className={styles.true} value="1">Ispravno</option>
                            <option className={styles.false} value="2">Neispravno</option>
                        </select>
                    </label>

                    <label className={styles.detail}>Opis:
                        <textarea className={styles.details} placeholder="Dodajte opis.." name=""></textarea>
                    </label>

                    <div >
                    <button className={styles.button} type="submit">Dodaj</button>
                    </div>
                </form>

            </div>            
        </div>
    )
}

export default Equipment;