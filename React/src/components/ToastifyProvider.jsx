import "../css/toast.css";
import { ToastContainer } from "react-toastify";

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
