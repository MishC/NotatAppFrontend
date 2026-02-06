import { useMemo } from "react";
import { useState } from "react";
import { createFolderAction } from "../../actions/noteActions";
import { getFoldersApiUrl } from "../../helpers/noteHelpers";
export default function AddFolderModal({ isOpen, onClose, setFolders, setError }) {
    const API_URL = getFoldersApiUrl();
    const [newFolderName, setNewFolderName] = useState("");
    const [error, setError] = useState(null);
    useMemo(() => {
        // This effect runs when newFolderName changes
        if (newFolderName) {
            setError(null);
        }
    }, [newFolderName]);


    const handleCreateFolder = async () => {
        try {
            await createFolderAction({ API_URL, folderName: newFolderName, setFolders, setError });
            setNewFolderName("");
            onClose();
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <Modal.Header>Create New Folder</Modal.Header>
            <Modal.Body>
                <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder Name"
                    className="w-full p-2 border border-gray-300 rounded"
                />
            </Modal.Body>
            <Modal.Footer>
                <button onClick={handleCreateFolder} className="bg-blue-500 text-white p-2 rounded">
                    Create Folder
                </button>
            </Modal.Footer>
        </Modal>
    );
}
