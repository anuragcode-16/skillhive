import { useState, createContext, useEffect, useContext } from "react";

const NavigationContext = createContext();

const NavigationProvider = ({ children }) => {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    useEffect(() => {
        const handler = () => {
            setCurrentPath(window.location.pathname);
        }
        window.addEventListener("popstate", handler);

        return () => {
            window.removeEventListener("popstate", handler);
        }
    }, []);

    const navigate = (path) => {
        window.history.pushState({},'', path)
        setCurrentPath(path);
    }

    return <NavigationContext.Provider value={{ currentPath, navigate }}>
        {children}
    </NavigationContext.Provider>
}

export const useNavigationContext = () => {
    return useContext(NavigationContext);
};

export { NavigationContext };
export default NavigationProvider;