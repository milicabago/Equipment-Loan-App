"use client"
import styles from '@/app/components/equipment/page.module.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import toast from 'react-hot-toast';
import Modal from 'react-modal';
import { MdSearch, MdFilterList } from "react-icons/md";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const EquipmentPage = () => {
    const [equipment, setEquipment] = useState([]);
    const [filterModalIsOpen, setFilterModalIsOpen] = useState(false);
    const [filterValues, setFilterValues] = useState({ name: '', quantity: [1, 100] });
    const [equipmentNames, setEquipmentNames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cookies] = useCookies(['accessToken']);
    const [equipmentToRead, setEquipmentToRead] = useState(null);
    const [readModalIsOpen, setReadModalIsOpen] = useState(false);
    const [equipmentToAssign, setEquipmentToAssign] = useState(null);
    const [assignModalIsOpen, setAssignModalIsOpen] = useState(false);
    const [assignQuantity, setAssignQuantity] = useState(1);
    const [currentQuantity] = useState();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredEquipment, setFilteredEquipment] = useState([]);

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const token = cookies.accessToken;
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + "user/equipment", config);
                const equipmentData = response.data;
                setEquipment(equipmentData);
                setEquipmentNames([...new Set(equipmentData.map(item => item.name))]);
                setLoading(false);
                console.log("Equipment:", equipmentData);
            } catch (error) {
                console.error("Error fetching equipment:", error);
            }
        };
        fetchEquipment();
    }, [cookies.accessToken]);

    const handleSliderChange = (value) => {
        setFilterValues({ ...filterValues, quantity: value });
    };

    useEffect(() => {
        const filteredByFilterValues = equipment.filter(item =>
            (filterValues.name.length === 0 || filterValues.name.includes(item.name)) &&
            (item.quantity >= filterValues.quantity[0] && item.quantity <= filterValues.quantity[1])
        );
    
        const filteredBySearchTerm = filteredByFilterValues.filter(item =>
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    
        setFilteredEquipment(filteredBySearchTerm);
    }, [filterValues, searchTerm, equipment]);

    const handleFilterChange = (e) => {
        const { name, value, checked } = e.target;
        if (name === "name") {
            const newNames = checked
                ? [...filterValues.name, value]
                : filterValues.name.filter(item => item !== value);
            setFilterValues({ ...filterValues, name: newNames });
        } else {
            setFilterValues({ ...filterValues, [name]: value });
        }
    };

    const resetFilters = () => {
        setFilterValues({ name: [], quantity: [1, 100] });
    };

    const handleFilterSubmit = () => {
        closeFilterModal();
    };

    const openFilterModal = () => setFilterModalIsOpen(true);
    const closeFilterModal = () => setFilterModalIsOpen(false);

    const assignEquipment = async (equipmentId) => {
        try {
            let token = document.cookie
                .split('; ')
                .find(row => row.startsWith('accessToken'))
                .split('=')[1];
            const equipmentToAssign = equipment.find(equipment => equipment._id === equipmentId);
            if (!Number.isInteger(assignQuantity) || assignQuantity <= 0 || assignQuantity > currentQuantity) {
                return;
            }
            await axios.post(process.env.NEXT_PUBLIC_BASE_URL + 'user/equipment/assignEquipment',
                {
                    assign_quantity: assignQuantity,
                    equipment_id: equipmentId
                }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            toast.success('Request sent successfully!', { duration: 3000 });
            closeAssignModal();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };
    

    const openReadModal = (equipment) => {
        setEquipmentToRead(equipment);
        setReadModalIsOpen(true);
    };
    const closeReadModal = () => {
        setEquipmentToRead(null);
        setReadModalIsOpen(false);
    };

    const openAssignModal = (equipment) => {
        setAssignQuantity(1);
        setEquipmentToAssign(equipment);
        setAssignModalIsOpen(true);
    };
    const closeAssignModal = () => {
        setEquipmentToAssign(null);
        setAssignModalIsOpen(false);
    };

    useEffect(() => {
        const filtered = equipment.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.full_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredEquipment(filtered);
    }, [searchTerm, equipment]);

    return (
        <div className={styles.container}>
            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                </div>
            ) : (
                <div>
                    <div className={styles.title}>
                        <h1>Equipment</h1>
                        <div>
                            <MdFilterList className={styles.filterIcon} onClick={openFilterModal} />
                        </div>
                    </div>
                    <div>
                        <div className={styles.search}>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={styles.inputs}
                            />
                            <MdSearch className={styles.searchIcon} />
                        </div>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>NAME</th>
                                <th>MODEL</th>
                                <th>QUANTITY</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEquipment.map(item => (
                                <tr 
                                key={item._id} 
                                className={`${item.quantity === 0 ? styles.darked : ''} 
                                            ${(equipmentToRead && item._id === equipmentToRead._id) || 
                                              (equipmentToAssign && item._id === equipmentToAssign._id) 
                                              ? styles.highlightedRow 
                                              : ''}`}
                            >
                                    <td className={styles.name}>{item.name}</td>
                                    <td className={styles.model}>{item.full_name}</td>
                                    <td className={styles.quantity}>{item.quantity}</td>
                                    <td className={styles.button}>
                                        <button
                                            className={styles.assign}
                                            onClick={() => openAssignModal(item)}
                                            disabled={item.quantity === 0}
                                        >
                                            Assign
                                        </button>
                                        <button className={styles.read} onClick={() => openReadModal(item)}>See More</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                isOpen={filterModalIsOpen}
                onRequestClose={closeFilterModal}
                contentLabel="Filter Modal"
                className={styles.modal}
                overlayClassName={styles.overlayy}
            >
                <h2 className={styles.modalTitle}>Filter Equipment</h2>
                <div className={styles.modalContent}>
                    <p>
                        <span className={styles.label}>Name: </span>
                        <span>
                            {equipmentNames.map(name => (
                                <div key={name}>
                                    <input
                                        type="checkbox"
                                        name="name"
                                        value={name}
                                        checked={filterValues.name.includes(name)}
                                        onChange={handleFilterChange}
                                        className={styles.input}
                                    />
                                    <label>{name}</label>
                                </div>
                            ))}
                        </span>
                    </p>

                    <p>
                        <span className={styles.label}>Quantity: </span>
                        <span>
                            <Slider
                                range
                                min={1}
                                max={100}
                                value={filterValues.quantity}
                                onChange={handleSliderChange}
                            />
                            <div>
                                <span>{filterValues.quantity[0]}</span> - <span>{filterValues.quantity[1]}</span>
                            </div>
                        </span>
                    </p>

                    <div className={styles.modalButtons}>
                        <button type="button" onClick={handleFilterSubmit}>Apply Filter</button>
                        <button type="button" onClick={resetFilters}>Reset</button>
                        <button type="button" onClick={closeFilterModal}>Close</button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={readModalIsOpen}
                onRequestClose={closeReadModal}
                className={styles.modal}
                overlayClassName={styles.overlay}
                contentLabel="Read Equipment Modal"
            >
                <h2 className={styles.modalTitle}>Equipment Details</h2>
                {equipmentToRead && (
                    <div className={styles.modalContent}>
                        <p><span className={styles.label}>Name: </span><span className={styles.value}>{equipmentToRead.name}</span></p>
                        <p><span className={styles.label}>Model: </span><span className={styles.value}>{equipmentToRead.full_name}</span></p>
                        <p><span className={styles.label}>Serial Number: </span><span className={styles.value}>{equipmentToRead.serial_number}</span></p>
                        <p><span className={styles.label}>Quantity: </span><span className={styles.value}>{equipmentToRead.quantity}</span></p>
                        <p><span className={styles.label}>Description: </span><span className={styles.value}>{equipmentToRead.description ? (equipmentToRead.description) : (<span className={styles.italic}>none</span>)}</span></p>
                    </div>
                )}
                <div className={styles.modalButtons}>
                    <button onClick={closeReadModal}>Close</button>
                </div>
            </Modal>
            <Modal
                isOpen={assignModalIsOpen}
                onRequestClose={closeAssignModal}
                className={styles.modal}
                overlayClassName={styles.overlay}
                contentLabel="Assigment Modal"
            >
                <h2 className={styles.modalTitle}>Assigment</h2>
                {equipmentToAssign && (
                    <div>
                        <p className={styles.question}>Current quantity: {equipmentToAssign.quantity}</p>
                        <label className={styles.question} htmlFor="assignQuantity">Quantity to assign:</label>
                        <input className={styles.inputt}
                            type="number"
                            id="assignQuantity"
                            min="1"
                            max={equipmentToAssign.quantity}
                            value={assignQuantity}
                            onChange={(e) => setAssignQuantity(parseInt(e.target.value))}
                        />
                        <p className={styles.question}> Are you sure you want to assign this equipment?</p>
                        <div className={styles.modalButtons}>
                            <button onClick={() => assignEquipment(equipmentToAssign._id)}>Confirm</button>
                            <button onClick={closeAssignModal}>Close</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
export default EquipmentPage;