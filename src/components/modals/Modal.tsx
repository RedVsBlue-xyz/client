// Custom Modal Component
export const Modal = ({ isVisible, onClose, children }: {isVisible: boolean, onClose: any, children: any[] }) =>{
    if (!isVisible) return null;
  
    return (
      <div className="modal">
        <button 
            onClick={onClose} 
            className="modal-close button"
            style={{padding:"20px", margin:"0px", position: 'absolute', top: '10px', right: '10px', background:"none", border:"none"}}
            >X</button>
        {children}
      </div>
    );
  };