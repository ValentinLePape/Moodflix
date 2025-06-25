import React from 'react'

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="modal-backdrop" 
      onClick={handleBackdropClick}
    >
      <div className="modal-content">
        <button 
          className="modal-close" 
          onClick={onClose}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  )
}

export default Modal
