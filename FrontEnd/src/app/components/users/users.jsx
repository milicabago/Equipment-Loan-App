"use client"
import styles from './users.module.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import Modal from 'react-modal';


const Users = () => {
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(['accessToken']);
  const router = useRouter();
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null)
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [userToRead, setUserToRead] = useState(null);
  const [readModalIsOpen, setReadModalIsOpen] = useState(false);
  const [editedUserData, setEditedUserData] = useState({});
  const formatDate = (dateTimeString) => {
        const date = new Date(dateTimeString);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString();
        return `${formattedDate} ${formattedTime}`;
    };


  useEffect(() => {
    const token = cookies.accessToken;

    if (token) {
      const decodedToken = jwtDecode(token);
      setLoggedInUser(decodedToken);
      console.log("Logged in user:", decodedToken)
      console.log("Logged in admin:", decodedToken.user.role)
      let config = {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      }
      if (decodedToken.user.role.includes('admin') ) {
        console.log("uspjeh", decodedToken.user.role)
        setIsAdmin(true);
        axios.get(process.env.NEXT_PUBLIC_BASE_URL + "admin/users", config)
        .then((response) => {
          setUsers(response.data);
          console.log("Users:", response.data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
      } else (console.log("greskaa:"))
    }
  }, [cookies.accessToken]);


  const deleteUser = (userId) => {
    const token = cookies.accessToken;

    if (token) {
      const decodedToken = jwtDecode(token);
      setLoggedInUser(decodedToken);
      let config = {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      }
      if (decodedToken.user.role.includes('admin')) {
        axios.delete(process.env.NEXT_PUBLIC_BASE_URL + `admin/users/${userId}`, config)
          .then((response) => {
            setUsers(users.filter(user => user._id !== userId));
            console.log("User successfully deleted:", userId); 
            toast.success(`User ${userId} has been deleted successfully!`);
            setDeleteModalIsOpen(false);
          })
          .catch((error) => {
            console.error("Error:", error);
            toast.error('Error deleting user!');
          });
        }
      }
    };

  const updateUser = async (id) => {
    try{
      const token = cookies.accessToken;
      const config = {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      };
      const isDataChanged = Object.keys(editedUserData).some(key => editedUserData[key] !== userToEdit[key]);

      if (isDataChanged) {
        await axios.patch(process.env.NEXT_PUBLIC_BASE_URL + `admin/users/${userToEdit._id}`, editedUserData, config);
        toast.success('User updated successfully!');
      } else {
        toast.info('No changes detected!');
      }
      closeEditModal();
    } catch (error) {
      console.error("Error:", error);
      toast.error('Error updating user!');  
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUserData({ ...editedUserData, [name]: value });
  };

  const readUser = async (id) => {
    try{
        const token = cookies.accessToken;
        const config = {
            headers: {
                'Authorization': 'Bearer ' + token
            }
            };
        const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + `admin/users/${id}` , config);
        setUserToRead(response.data);
        setReadModalIsOpen(true);
    } catch (error) {
        console.error("Error:", error);
        toast.error('Error fetching user data!');
    }
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
  };
  const openDeleteModal = async (id) => {
    try{
      const token = cookies.accessToken;
      const decodedToken = jwtDecode(token);
      const config = {
        headers: {
          'Authorization': 'Bearer ' + cookies.accessToken
        }
      };
      const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + `admin/users/${id}`, config);
      setUserToDelete(response.data);
      setDeleteModalIsOpen(true);
      
    } catch (error) {
      console.error("Error:", error);
      toast.error('Error fetching user data!');
    }
  };

  const closeDeleteModal = () => {
    setDeleteModalIsOpen(false);
    setUserToDelete(null);
  };

  const openEditModal = (user) => {
    setUserToEdit(user);
    setEditedUserData(user);
    setEditModalIsOpen(true);
  };

  const closeEditModal = () => {
    setUserToEdit(null);
    setEditModalIsOpen(false);
  };
        
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <h1>Korisnici</h1>
      </div>
      
      <div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>NAME</th>
              <th>ROLE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td className={styles.profile}>
                  <div className={styles.photo}>
                    <img src="/noavatar.png" alt="" className={styles.photoImg} />
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
                <div className={styles.status}>Active</div>
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
            <button onClick={() => deleteUser(userToDelete._id)}>Delete</button>
          )}
          <button onClick={closeDeleteModal}>Cancel</button>
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
                <p><span className={styles.label}>Role: </span><span className={styles.value}>{userToRead.role}</span></p>
                <p><span className={styles.label}>Username: </span><span className={styles.value}>{userToRead.username}</span></p>
                <p><span className={styles.label}>Contact: </span><span className={styles.value}>{userToRead.contact}</span></p>
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
          <input
            type="text"
            name="username"
            value={editedUserData.username || userToEdit.username}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="email"
            value={editedUserData.email || userToEdit.email}
            onChange={handleInputChange}
          />
          <select
          name="role"
            value={editedUserData.role || userToEdit.role}
            onChange={handleInputChange}
          >
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <select
          name="position"
          value={editedUserData.position || userToEdit.position}
          onChange={handleInputChange}
          >
            <option value="1">Project manager</option>
            <option value="2">Software developer</option>
            <option value="3">Graphic designer</option>
            <option value="4">Financial accountant</option>
            <option value="5">DevOps Engineer</option>
            <option value="6">Junior Product Owner</option>
          </select>

          
          

          
        </div>
      )}
      <div className={styles.modalButtons}>
      <button onClick={updateUser} disabled={Object.keys(editedUserData).length === 0}>Save</button>        <button onClick={closeEditModal}>Cancel</button>
      </div>
    </Modal>
    </div>
  );
}
export default Users;