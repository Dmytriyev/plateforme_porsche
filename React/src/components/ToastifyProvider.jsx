import React from "react";
import { ToastContainer } from "react-toastify";
import "../css/toast.css";

export default function ToastifyProvider() {
    return (
        <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            toastClassName="app-toast"
            bodyClassName="app-toast-body"
            closeButton={false}
        />
    );
}
