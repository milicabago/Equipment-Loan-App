"use client";
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/navigation';
import jwtDecode from 'jwt-decode';

export const useLogout = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['accessToken']);
    const router = useRouter();

    const handleLogout = () => {
        const token = cookies.accessToken;
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const userId = decodedToken.user._id;
                console.log(userId);
                localStorage.removeItem('userId');
            } catch (error) {
                console.log(error);
            }
        }
        removeCookie('accessToken');
        router.push('/auth/login');
    };

    return { handleLogout };
};