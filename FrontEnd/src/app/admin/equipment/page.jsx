"use client"
import styles from '@/app/components/equipment/page.module.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import Modal from 'react-modal';
import { MdSearch, MdFilterList, MdPlaylistAdd } from "react-icons/md";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const EquipmentPage = () => {

    const [filterModalIsOpen, setFilterModalIsOpen] = useState(false);
    const [filterValues, setFilterValues] = useState({ name: '', quantity: [1, 100] });
    const [equipment, setEquipment] = useState([]);
    const [equipmentNames, setEquipmentNames] = useState([]);
    const [cookies] = useCookies(['accessToken']);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
    const [equipmentToDelete, setEquipmentToDelete] = useState(null);
    const [equipmentToEdit, setEquipmentToEdit] = useState(null);
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [equipmentToRead, setEquipmentToRead] = useState(null);
    const [readModalIsOpen, setReadModalIsOpen] = useState(false);
    const [editedEquipmentData, setEditedEquipmentData] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredEquipment, setFilteredEquipment] = useState([])

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const token = cookies.accessToken;
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + "admin/equipment", config);
                const equipmentData = response.data;
                setEquipment(equipmentData);
                setEquipmentNames([...new Set(equipmentData.map(item => item.name))]);
                setLoading(false);
                console.log("Equipment:", equipmentData);
            } catch (error) {
            }
        };
        fetchEquipment();
    }, [cookies.accessToken]);
    
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

    const handleSliderChange = (value) => {
        setFilterValues({ ...filterValues, quantity: value });
    };

    const resetFilters = () => {
        setFilterValues({ name: [], quantity: [1, 100] });
    };

    const handleFilterSubmit = () => {
        closeFilterModal();
    };

    const openFilterModal = () => setFilterModalIsOpen(true);
    const closeFilterModal = () => setFilterModalIsOpen(false);

    useEffect(() => {
        const filtered = equipment.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.full_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredEquipment(filtered);
    }, [searchTerm, equipment]);

    const handleEdit = (field, value) => {
        setEditedEquipmentData({ ...editedEquipmentData, [field]: value });
    };

    const handleSave = async () => {
        try {
            if (JSON.stringify(editedEquipmentData) === JSON.stringify(equipmentToEdit)) {
               toast.error("No changes have been made.", { duration: 3000 });
               return;
         }
          let token = document.cookie.split('; ').find(row => row.startsWith('accessToken=')).split('=')[1];
          const { name, full_name, model, serial_number, quantity,  description, invalid_quantity  } = editedEquipmentData;
          const dataToUpdate = { name, full_name, model, serial_number, quantity, description, invalid_quantity};
          const response = await axios.put(process.env.NEXT_PUBLIC_BASE_URL + `admin/equipment/${equipmentToEdit._id}`, dataToUpdate, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.status === 200) {
            toast.success("Equipment updated successfully.", { duration: 2000 });
           
            setEquipment(equipment.map(equip => {
                if (equip._id === equipmentToEdit._id) {
                    return { ...equip, ...editedEquipmentData};
                }
                return equip;
            }));
            closeEditModal();
            } else {
                toast.error("Failed to update equipment.");
            }
        } catch (error) {
            toast.error("Failed to update equipment. Please try again later.");
        }
    };

    const deleteEquipment = async (itemId) => {
        const token = cookies.accessToken;
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}admin/equipment/${itemId}`, config);
            const equipmentData = response.data;
            await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}admin/equipment/${itemId}`, config);
            setEquipment(equipment.filter(item => item._id !== itemId));
            setDeleteModalIsOpen(false);
            toast.success("Equipment deleted successfully!");
        } catch (error) {
            toast.error(error.response.data.message, { duration: 3000 });
        }
    };

    const openEditModal = (item) => {
        setEquipmentToEdit(item);
        setEditedEquipmentData(item);
        setEditModalIsOpen(true);
    };
    const closeEditModal = () => {
        setEquipmentToEdit(null);
        setEditModalIsOpen(false);
    };
    
    const openDeleteModal = async (itemId) => {
        try {
            const token = cookies.accessToken;
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + `admin/equipment/${itemId}`, config);
            setEquipmentToDelete(response.data);
            setDeleteModalIsOpen(true);
        } catch (error) {
            console.error("Error:", error);
        }
    };
    const closeDeleteModal = () => {
        setDeleteModalIsOpen(false);
        setEquipmentToDelete(null);
    };

    const openReadModal = (equipment) => {
        setEquipmentToRead(equipment);
        setReadModalIsOpen(true);
    };
    const closeReadModal = () => {
        setEquipmentToRead(null);
        setReadModalIsOpen(false);
    };

    return (
        <div className={styles.container}>
            <div>
                <div className={styles.title}>
                    <h1>Equipment</h1>
                    <div>
                        <div className={styles.iconWrapper}>
                            <MdPlaylistAdd 
                                className={styles.filterIcon} 
                                onClick={() => router.push('/admin/addEquipment')} 
                            />
                            <span className={styles.tooltip}>Create new equipment</span>
                        </div>
                        <div className={styles.iconWrapper}>
                            <MdFilterList 
                                className={styles.filterIcon} 
                                onClick={openFilterModal}
                            />
                            <span className={styles.tooltip}>Filter Equipment</span>
                        </div>
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
                            <th>SERIAL NUMBER</th>
                            <th className={styles.narrow}>AVAILABLE QUANTITY</th>
                            <th className={styles.narrow}>ASSIGNED QUANTITY</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEquipment.map(item => (
                            <tr key={item._id} className={
                                (equipmentToEdit && item._id === equipmentToEdit._id) || 
                                (equipmentToDelete && item._id === equipmentToDelete._id) ||
                                (equipmentToRead && item._id === equipmentToRead._id)
                                ? styles.highlightedRow 
                                : ''
                            }
                            >            
                                <td className={styles.nameColumn}>
                                    <div className={styles.name}>{item.name}</div>
                                    <div className={styles.model}>{item.full_name}</div>
                                </td>

                                <td className={styles.narrow}>{item.serial_number}</td>
                                <td className={styles.narrow}>{item.quantity}</td>
                                <td className={styles.narrow}>{item.assigned_quantity}</td>
                                <td>
                                    <button className={styles.edit} onClick={() => openEditModal(item)}>Edit</button>
                                    <button className={styles.delete} onClick={() => openDeleteModal(item._id)}>Delete</button>
                                    <button className={styles.seeMore} onClick={() => openReadModal(item)}>See More</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={filterModalIsOpen}
                onRequestClose={closeFilterModal}
                contentLabel="Filter Modal"
                className={styles.modal}
                overlayClassName={styles.overlay}
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
                isOpen={editModalIsOpen}
                onRequestClose={closeEditModal}
                className={styles.modal}
                overlayClassName={styles.overlay}
                contentLabel="Edit Equipment Modal"
            >
                <h2 className={styles.modalTitle}>Edit equipment</h2>
                {equipmentToEdit && (
                    <div className={styles.modalContent}>
                        <p>
                            <span className={styles.label}>Name: </span>
                            <span>
                                <input
                                    type="text"
                                    name="name"
                                    value={editedEquipmentData.name}
                                    onChange={(e) => handleEdit('name', e.target.value)}
                                    className={styles.input}
                                    autoComplete='off'
                                />
                            </span>
                        </p>
                        <p>
                            <span className={styles.label}>Model: </span>
                            <span>
                                <input
                                    type="text"
                                    name="model"
                                    value={editedEquipmentData.full_name}
                                    onChange={(e) => handleEdit('full_name', e.target.value)}
                                    className={styles.input}
                                    autoComplete='off'
                                />
                            </span>
                        </p>
                        <p>
                            <span className={styles.label}>Serial number: </span>
                            <span>
                                <input
                                    type="text"
                                    name="serial_number"
                                    value={editedEquipmentData.serial_number}
                                    onChange={(e) => handleEdit('serial_number', e.target.value)}
                                    className={styles.input}
                                    autoComplete='off'
                                />
                            </span>
                        </p>
                        <p>
                            <span className={styles.label}>Quantity: </span>
                            <span>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={editedEquipmentData.quantity}
                                    onChange={(e) => handleEdit('quantity', e.target.value)}
                                    className={styles.input}
                                    min={1}
                                    autoComplete='off'
                                />
                            </span>
                        </p>
                        <p>
                            <span className={styles.label}>Description: </span>
                            <span>
                                <input
                                    type="text"
                                    name="description"
                                    placeholder="none"
                                    value={editedEquipmentData.description || ""}
                                    onChange={(e) => handleEdit('description', e.target.value)}
                                    className={styles.input}
                                    autoComplete='off'
                                />
                            </span>
                        </p>
                    </div>
                )}
                <div className={styles.modalButtons}>
                    <button onClick={handleSave} disabled={JSON.stringify(editedEquipmentData) === JSON.stringify(equipmentToEdit)}>Save</button>
                    <button onClick={closeEditModal}>Dismiss</button>
                </div>
            </Modal>

            <Modal
                isOpen={deleteModalIsOpen}
                onRequestClose={closeDeleteModal}
                className={styles.modal}
                overlayClassName={styles.overlay}
                contentLabel="Delete Equipment Confirmation Modal"
            >
                <h2 className={styles.modalTitle}>Delete equipment</h2>
                {equipmentToDelete && (
                    <div className={styles.modalContent}>
                        <p className={styles.modalMessage}>
                            Are you sure you want to delete? <strong>{equipmentToDelete.first_name} {equipmentToDelete.last_name}</strong>
                        </p>
                    </div>
                )}
                <div className={styles.modalButtons}>
                    {equipmentToDelete && (
                        <button onClick={() => deleteEquipment(equipmentToDelete._id)}>Confirm</button>
                    )}
                    <button onClick={closeDeleteModal}>Dismiss</button>
                </div>
            </Modal>

            <Modal
                isOpen={readModalIsOpen}
                onRequestClose={closeReadModal}
                className={styles.modal}
                overlayClassName={styles.overlay}
                contentLabel="Read Equipment Modal"
            >
                <h2 className={styles.modalTitle}>Equipment details</h2>
                {equipmentToRead && (
                    <div className={styles.modalContent}>
                        <p><span className={styles.label}>Name: </span><span className={styles.value}>{equipmentToRead.name}</span></p>
                        <p><span className={styles.label}>Model: </span><span className={styles.value}>{equipmentToRead.full_name}</span></p>
                        <p><span className={styles.label}>Serial number: </span><span className={styles.value}>{equipmentToRead.serial_number}</span></p>
                        <p><span className={styles.label}>Available Quantity: </span><span className={styles.value}>{equipmentToRead.quantity}</span></p>
                        <p><span className={styles.label}>Assigned quantity: </span><span className={styles.value}>{equipmentToRead.assigned_quantity}</span></p>
                        <p><span className={styles.label}>Description: </span><span className={styles.value}>{equipmentToRead.description ? (equipmentToRead.description) : (<span className={styles.italic}>none</span>)}</span></p>
                    </div>
                )}
                <div className={styles.modalButtons}>
                    <button onClick={closeReadModal}>Close</button>
                </div>
            </Modal>
        </div>
    )
}

export default EquipmentPage;