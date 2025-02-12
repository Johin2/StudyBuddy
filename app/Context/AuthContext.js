'use client'

import { createContext, useContext, useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const router = useRouter();

    const refresAcessToken = async() => {
        const storedRefreshToken = localStorage.getItem('refresh_token')
        if (!storedRefreshToken){
            logout();
            return;
        }

        try{
            const res = await fetch('/api/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({refreshToken: storedRefreshToken})
            });
            if(!res.ok){
                logout();
                return;
            }
            const data = await res.json();
            const newAccessToken = data.token;
            localStorage.setItem("access_token", newAccessToken);
            const decoded = jwtDecode(newAccessToken)
            setUser(decoded)
        }catch (error){
            console.log("Error refreshing token: ", error)
            logout();
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("access_token"); 
        if (token){
            try{
                const decoded = jwtDecode(token)

                if (decoded.exp * 1000 < Date.now()) {
                    refresAcessToken();
                } else {
                    setUser(decoded)
                }
            }
            catch (error){
                console.log("Error decoding token", error)
                logout();
            }
            
        }
    }, [])

    const login =  async ({email, password}) => {
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({email, password})
            });

            if (!res.ok) {
                throw new Error('Login Failed')
            }

            const {token, refreshToken} = await res.json()

            localStorage.setItem('access_token', token)
            localStorage.setItem('refreshToken', refreshToken)

            const decoded = jwtDecode(token);
            setUser(decoded)

            router.push('/home')
        } catch (error) {
            console.log('Login error:', error)
        }
    }

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken')
        setUser(null);
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{user, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
};

export const useAuth = () => useContext(AuthContext)