import './DeleteGroupConfirmationModal.css';

const DeleteGroupConfirmationModal = ({ show, onClose, onConfirm }) => {
  if (!show) {
    return null;
  }
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h1>Confirm Delete</h1>
        <p>Are you sure you want to remove this group?</p>
        <button onClick={onConfirm} className="confirm-button">Yes (Delete Group)</button>
        <button onClick={onClose} className="cancel-button">No (Keep Group)</button>
      </div>
    </div>
  );
};

export default DeleteGroupConfirmationModal;