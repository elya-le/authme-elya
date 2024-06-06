import './DeleteEventConfirmationModal.css';

const DeleteEventConfirmationModal = ({ show, onClose, onConfirm }) => {
  if (!show) {
    return null;
  }
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h1>Confirm Delete</h1>
        <p>Are you sure you want to remove this event?</p>
        <button onClick={onConfirm} className="confirm-button">Yes (Delete Event)</button>
        <button onClick={onClose} className="cancel-button">No (Keep Event)</button>
      </div>
    </div>
  );
};

export default DeleteEventConfirmationModal;