

import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";

const VotarModal = ({ isOpen, candidato, onConfirm, onCancel, loading }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Confirmar Voto"
      footer={
        <>
          <Button
            onClick={onCancel}
            disabled={loading}
            variant="secondary"
            className="px-6 py-2 border rounded-lg hover:bg-gray-100  disabled:opacity-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="px-6 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Confirmar Voto '}
          </Button>
        </>
      }
    >
      <div className="text-center py-6">
        <div className="text-6xl mb-4">🗳️</div>
        <h3 className="text-2xl font-bold mb-4">
          ¿Confirmas tu voto por <span className="text-primary">{candidato?.nombre}</span>?
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Partido: <strong>{candidato?.partido}</strong>
        </p>
        <div className="bg-yellow-50 dark:bg-yellow-100 border border-yellow-100 dark:border-yellow-400 rounded-lg p-4 mt-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-700">
            ⚠️ <strong>Importante:</strong> Esta acción no se puede revertir. 
            Una vez registrado tu voto, no podrás cambiarlo.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default VotarModal;