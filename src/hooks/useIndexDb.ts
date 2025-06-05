import { IndexDbContext } from "@/context/IndexDbContext";
import { useContext } from "react";

export const useIndexDb = () => {
    const context = useContext(IndexDbContext);
    if (!context) {
        throw new Error('IndexDbContext must be used within a IndexDbProvider');
    }
    return context;
};
