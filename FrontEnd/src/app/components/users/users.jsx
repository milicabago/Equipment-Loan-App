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
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null)
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);


  useEffect(() => {
    const token = cookies.accessToken;

    if (token) {
      const decodedToken = jwtDecode(token);
      setLoggedInUser(decodedToken);
      console.log("Logged in user:", decodedToken)
      console.log("Logged in admin:", decodedToken.user.role)
      let config = {
        headers: {
          'Authorization': 'Bearer ' + cookies.accessToken
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
          'Authorization': 'Bearer ' + cookies.accessToken
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
      const decodedToken = jwtDecode(token);
      const config = {
        headers: {
          'Authorization': 'Bearer ' + cookies.accessToken
        }
      };
      const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + `admin/users/${id}`, config);
      setUserToEdit(response.data);
      setEditModalIsOpen(true);
    } catch (error) {
      console.error("Error:", error);
      toast.error('Error fetching user data!');
    }

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

      <Modal
      isOpen={editModalIsOpen}
      onRequestClose={closeEditModal}
      className={styles.modal}
      overlayClassName={styles.overlay}
      contentLabel="Edit User Modal"
    >
      <h2 className={styles.modalTitle}>Edit User</h2>
      {userToEdit && (
        <div className={styles.modalContent}>
          
          <input
            type="text"
            value={userToEdit.first_name}
            onChange={(e) => setUserToEdit({...userToEdit, first_name: e.target.value})}
          />
          <input
            type="text"
            value={userToEdit.last_name}
            onChange={(e) => setUserToEdit({...userToEdit, last_name: e.target.value})}
          />
          <input
            type="text"
            value={userToEdit.email}
            onChange={(e) => setUserToEdit({...userToEdit, email: e.target.value})} 
          />
          <select
            value={userToEdit.role}
            onChange={(e) => setUserToEdit({...userToEdit, role: e.target.value})}
          >
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>

          <input
            type="text"
            value={userToEdit.username}
            onChange={(e) => setUserToEdit({...userToEdit, username: e.target.value})}
          />
          <input
            type="text"
            value={userToEdit.phone}
            onChange={(e) => setUserToEdit({...userToEdit, phone: e.target.value})}
          />

          
        </div>
      )}
      <div className={styles.modalButtons}>
        <button onClick={closeEditModal}>Cancel</button>
        <button onClick={updateUser}>Save</button>
      </div>
    </Modal>
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
        <h2 className={styles.modalTitle}>Delete User</h2>
        {userToDelete && (
          <div className={styles.modalContent}>
            <p className={styles.modalMessage}>
              Are you sure you want to delete <strong>{userToDelete.first_name} {userToDelete.last_name}</strong>?
            </p>
          </div>
        )}
        <div className={styles.modalButtons}>
          <button onClick={closeDeleteModal}>Cancel</button>
          {userToDelete && (
            <button onClick={() => deleteUser(userToDelete._id)}>Delete</button>
          )}
        </div>
      </Modal>


    </div>
  );
}
export default Users;