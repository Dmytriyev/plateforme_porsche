import { useContext } from 'react';
import { PanierContext } from '../context/PanierContext.jsx';

export const usePanier = () => {
    const context = useContext(PanierContext);
    if (!context) {
        throw new Error('usePanier doit être utilisé à l\'intérieur de PanierProvider');
    }
    return context;
};
