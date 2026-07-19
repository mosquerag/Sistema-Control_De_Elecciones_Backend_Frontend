
// import { formatDateTime } from '@/utils/formatDate';
// import { Calendar, CheckCircle } from 'lucide-react';
// import Card from "@/components/common/Card";
// import Avatar from "@/components/common/Avatar";
// import EmptyState from "@/components/common/EmptyState";


// const MisVotos = ({ votos }) => {


//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//       {votos.map((voto) => (
//         <Card
//           key={voto._id}
//           className="overflow-hidden border-t-4 border-green-500 dark:border-green-400"
//         >
//           {/* Header */}
//           <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 border-b dark:from-slate-900 dark:to-slate-700 border-gray-200 -m-6 mb-4">
//             <div className="flex items-start justify-between gap-2 mb-2">
//               <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white line-clamp-2 flex-1">
//                 {voto.idEleccion?.titulo || voto.idEleccion?.nombre || 'Elección'}
//               </h3>
//               <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0" />
//             </div>
//             <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-200">
//               <Calendar className="w-3.5 h-3.5" />
//               <span>{formatDateTime(voto.fechaVoto)}</span>
//             </div>
//           </div>

//           {/* Badge "Ya has votado" */}
//           <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-green-300 text-green-900 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-bold">
//             <CheckCircle className="w-3.5 h-3.5" />
//             Ya has votado en esta elección
//           </div>

//           {/* Contenido */}
//           <div>
//             <p className="text-xs font-semibold text-gray-500 dark:text-gray-200 uppercase mb-3">
//               Votaste por:
//             </p>
            
//             <div className="flex items-center gap-4">
//               <Avatar
//                 nombre={voto.idCandidato?.nombre || 'Candidato'}
//                 foto={voto.idCandidato?.fotoPerfil || null}
//                 size="lg"
//                 shape="rounded"
//                 gradient="from-green-400 to-blue-500"
//               />
//               {/* Info */}
//               <div className="flex-1 min-w-0">
//                 <p className="font-bold text-gray-800 dark:text-white text-base md:text-lg mb-1 line-clamp-2">
//                   {voto.idCandidato?.nombre || 'Candidato no disponible'}
//                 </p>
//                 <p className="text-sm text-blue-600 dark:text-blue-400 font-medium truncate">
//                   {voto.idCandidato?.partido || 'Sin partido'}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </Card>
//       ))}

//       {/* Estado vacío */}
//       {votos.length === 0 && (
//         <Card className="col-span-full text-center py-16">
//           <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
//             <span className="text-4xl">🗳️</span>
//           </div>
//           <EmptyState
//             title="Aún no has votado"
//             description="Participa en las elecciones para que tus votos aparezcan aquí"
//           />
//         </Card>
//       )}
//     </div>
//   );
// };

// export default MisVotos;




import { formatDateTime } from '@/utils/formatDate';
import { Calendar, CheckCircle } from 'lucide-react';
import Card from "@/components/common/Card";
import EmptyState from "@/components/common/EmptyState";


const MisVotos = ({ votos }) => {


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {votos.map((voto) => (
        <Card
          key={voto._id}
          className="overflow-hidden border-t-4 border-green-500 dark:border-green-400"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 border-b dark:from-slate-900 dark:to-slate-700 border-gray-200 -m-6 mb-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white line-clamp-2 flex-1">
                {voto.idEleccion?.titulo || voto.idEleccion?.nombre || 'Elección'}
              </h3>
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0" />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-200">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDateTime(voto.fechaVoto)}</span>
            </div>
          </div>

          {/* Badge "Ya has votado" */}
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-green-300 text-green-900 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-bold">
            <CheckCircle className="w-3.5 h-3.5" />
            Ya has votado en esta elección
          </div>

        </Card>
      ))}

      {/* Estado vacío */}
      {votos.length === 0 && (
        <Card className="col-span-full text-center py-16">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">🗳️</span>
          </div>
          <EmptyState
            title="Aún no has votado"
            description="Participa en las elecciones para que tus votos aparezcan aquí"
          />
        </Card>
      )}
    </div>
  );
};

export default MisVotos;