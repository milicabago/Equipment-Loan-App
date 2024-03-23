/*"use client";
import { authenticate } from '@app/lib/actions.js';
import styles from './loginForm.module.css';
import { useFormState } from "react-dom";

const LoginForm = () => {
    const [state, formAction] = useFormState( authenticate, undefined);

    return (
        <form action={formAction} className={styles.form}>
            <label htmlFor="username">Username</label>
            <input type="text" name="username" id="username" />
            <label htmlFor="password">Password</label>
            <input type="password" name="password" id="password" />
            <button>Login</button>
            {state && state }
        </form>
    );
};
export default LoginForm; */