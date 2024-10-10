"use client"
import styles from './page.module.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Modal from 'react-modal';
import { MdSearch, MdPersonAdd } from "react-icons/md";
import Image from 'next/image';
import io from 'socket.io-client';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [cookies] = useCookies(['accessToken']);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null)
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [userToRead, setUserToRead] = useState(null);
  const [readModalIsOpen, setReadModalIsOpen] = useState(false);
  const [editedUserData, setEditedUserData] = useState({});
  const [originalUserData, setOriginalUserData] = useState(null);
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  
  const formatDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return `${date.toLocaleDateString('hr-HR')} ${date.toLocaleTimeString('hr-HR')}`; 
  };

  const fetchUsers = async () => {
    const token = cookies.accessToken;
    let config = {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    };
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + "admin/users", config);
      setUsers(response.data);
      console.log("Users:", response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchUsers(); 
  }, [cookies.accessToken]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const socket = io('http://localhost:5001', { query: { user_id: userId } });
    setSocket(socket);

    socket.on('adminUpdateUserOrAdminProfile', (notification) => {
      toast.success(notification.message, { duration: 3000 });
    });

    return () => {
      if (socket) socket.close();
    };
  }, []);

  const handleEdit = (field, value) => {
    setEditedUserData({ ...editedUserData, [field]: value });
  };

  const handleSave = async () => {
    try {
        if (JSON.stringify(editedUserData) === JSON.stringify(originalUserData)) {
            toast.error("No changes have been made.", { duration: 3000 });
            return;
        }
        let token = document.cookie.split('; ').find(row => row.startsWith('accessToken=')).split('=')[1];
        const { username, role, position } = editedUserData;
        const dataToUpdate = { username, role, position };
        const hasRoleChanged = originalUserData && originalUserData.role !== role;

        const response = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL + `admin/users/${userToEdit._id}`, dataToUpdate, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 200) {
            toast.success("User updated successfully.", { duration: 3000 });
  
            if (hasRoleChanged) {
                setTimeout(() => {
                    toast('The user\'s role has been changed!', {
                        icon: '⚠️ ',
                        duration: 3000
                    });
                }, 2000);
            }
            closeEditModal();
            fetchUsers();
        } else {
            toast.error("Failed to update user.");
        }
    } catch (error) {
        console.error("Error updating user:", error);
        toast.error(error.response.data.message, { duration: 3000 });
    }
};

  

  const deleteUser = async (userId) => {
    const token = cookies.accessToken;
    let config = {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    };
    try {
      const response = await axios.delete(process.env.NEXT_PUBLIC_BASE_URL + `admin/users/${userId}`, config);
      console.log("User deleted:", response.data);
      toast.success("User deleted successfully.", { duration: 3000 });
      fetchUsers();
      setDeleteModalIsOpen(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response.data.message, { duration: 3000 });
      setDeleteModalIsOpen(true);
    }
  };
  

  const readUser = async (id) => {
    try {
      const token = cookies.accessToken;
      const config = {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      };
      const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + `admin/users/${id}`, config);
      setUserToRead(response.data);
      setReadModalIsOpen(true);
    } catch (error) {
      console.error("Error:", error);
      toast.error('Error fetching user data!');
    }
  };

  const openDeleteModal = async (id) => {
    try {
      const token = cookies.accessToken;
      const config = {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      };
      const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + `admin/users/${id}`, config);
      setUserToDelete(response.data);
      setDeleteModalIsOpen(true);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response.data.message, { duration: 3000 });
    }
  };
  const closeDeleteModal = () => {
    setDeleteModalIsOpen(false);
    setUserToDelete(null);
  };

  const openEditModal = (user) => {
    setUserToEdit(user);
    setEditedUserData(user); 
    setOriginalUserData(user);
    setEditModalIsOpen(true);
  };
  const closeEditModal = () => {
    setUserToEdit(null);
    setEditModalIsOpen(false);
  };

  const openReadModal = (id) => {
    setUserToRead(id);
    readUser(id);
    setReadModalIsOpen(true);
    console.log(id);
    console.log(userToRead);
    console.log(readModalIsOpen);
  };
  const closeReadModal = () => {
    setReadModalIsOpen(false);
    setUserToRead(null);
  };

  useEffect(() => {
    const filtered = users.filter(item =>
      item.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <h1>All users</h1>
        <div className={styles.iconWrapper}>
          <MdPersonAdd 
            className={styles.icon} 
            onClick={() => router.push('/admin/createUser')} 
          />
          <span className={styles.tooltip}>Add new user</span>
        </div>
      </div>
      <div>
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
              <th>ROLE</th>
              <th>CONTACT</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id} className={
                (userToEdit && user._id === userToEdit._id) || 
                (userToDelete && user._id === userToDelete._id) ||
                (userToRead && user._id === userToRead._id)
                ? styles.highlightedRow 
                : ''
            }
            >               
                <td className={styles.profile}>
                  <div className={styles.photo}>
                    <Image src="/noavatar.png" alt="" width="50" height="50" className={styles.photoImg} />
                  </div>
                  <div className={styles.details}>
                    <div className={styles.name}>{user.first_name} {''} {user.last_name}</div>
                    <div className={styles.email}>{user.email}</div>
                  </div>
                </td>
                <td>
                  <div className={styles.userRole}>
                    <div className={styles.role}>{user.role}</div>
                    <div className={styles.position}>{user.position}</div>
                  </div>
                </td>
                <td>
                  <div className={styles.contact}>{user.contact ? (user.contact) : (<span className={styles.italic}>none</span>)}
                  </div>
                </td>
                <td>
                  <button className={styles.edit} onClick={() => openEditModal(user)}>Edit</button>
                  <button className={styles.delete} onClick={() => openDeleteModal(user._id)}>Delete</button>
                  <button className={styles.seeMore} onClick={() => openReadModal(user._id)}>See More</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={closeDeleteModal}
        className={styles.modal}
        overlayClassName={styles.overlay}
        contentLabel="Delete User Confirmation Modal"
      >
        <h2 className={styles.modalTitle}>Delete user</h2>
        {userToDelete && (
          <div className={styles.modalContent}>
            <p className={styles.modalMessage}>
              Are you sure you want to delete <strong>{userToDelete.first_name} {userToDelete.last_name}</strong>?
            </p>
          </div>
        )}
        <div className={styles.modalButtons}>
          {userToDelete && (
            <button onClick={() => deleteUser(userToDelete._id)}>Confirm</button>
          )}
          <button onClick={closeDeleteModal}>Dismiss</button>
        </div>
      </Modal>

      <Modal
        isOpen={readModalIsOpen}
        onRequestClose={closeReadModal}
        className={styles.modal}
        overlayClassName={styles.overlay}
        contentLabel="Read User Modal" >
        <h2 className={styles.modalTitle}>User details</h2>
        {userToRead && (
          <div className={styles.modalContent}>
            <p><span className={styles.label}>Name: </span><span className={styles.value}>{userToRead.first_name} {userToRead.last_name}</span></p>
            <p><span className={styles.label}>Email: </span><span className={styles.value}>{userToRead.email}</span></p>
            <p><span className={styles.label}>Username: </span><span className={styles.value}>{userToRead.username}</span></p>
            <p><span className={styles.label}>Position: </span><span className={styles.value}>{userToRead.position}</span></p>
            <p><span className={styles.label}>Role: </span><span className={styles.value}>{userToRead.role}</span></p>
            <p><span className={styles.label}>Contact: </span><span className={styles.value}>{userToRead.contact ? (userToRead.contact) : (<span className={styles.italic}>none</span>)}</span></p>
            <p><span className={styles.label}>Created at: </span><span className={styles.value}>{formatDate(userToRead.createdAt)}</span></p>
            <p><span className={styles.label}>Updated at: </span><span className={styles.value}>{formatDate(userToRead.updatedAt)}</span></p>
          </div>
        )}
        <div className={styles.modalButtons}>
          <button onClick={closeReadModal}>Close</button>
        </div>
      </Modal>

      <Modal
        isOpen={editModalIsOpen}
        onRequestClose={closeEditModal}
        className={styles.modal}
        overlayClassName={styles.overlay}
        contentLabel="Edit User Modal"
      >
        <h2 className={styles.modalTitle}>Edit user</h2>
        {userToEdit && (
          <div className={styles.modalContent}>
            <p>
              <span className={styles.label}>Username: </span>
              <span>
                <input
                  type="text"
                  name="username"
                  value={editedUserData.username}
                  onChange={(e) => handleEdit('username', e.target.value)}
                  className={styles.input}
                />
              </span>
            </p>
            <p>
              <span className={styles.label}>Role: </span>
              <span>
                <select
                  name="role"
                  value={editedUserData.role}
                  onChange={(e) => handleEdit('role', e.target.value)}
                  className={styles.input}
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </span>
            </p>
            <p>
              <span className={styles.label}>Position: </span>
              <span>
                <select
                  name="position"
                  value={editedUserData.position}
                  onChange={(e) => handleEdit('position', e.target.value)}
                  className={styles.input}
                >
                  <option value="Project manager">Project manager</option>
                  <option value="Software developer">Software developer</option>
                  <option value="Graphic designer">Graphic designer</option>
                  <option value="Financial accountant">Financial accountant</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Junior Product Owner">Junior Product Owner</option>
                </select>
              </span>
            </p>
          </div>
        )}
        <div className={styles.modalButtons}>
          <button 
            onClick={handleSave} 
            disabled={!editedUserData.username || JSON.stringify(editedUserData) === JSON.stringify(originalUserData)}
          >
              Save
          </button>          
          <button onClick={closeEditModal}>Dismiss</button>
        </div>
      </Modal>
    </div>
  );
}
export default UsersPage;